const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const notificationService = require('../services/notificationService');
const geocodingService = require('../services/geocoding');

// Debug middleware to log all requests to public routes
router.use((req, res, next) => {
  console.log(`Public route: ${req.method} ${req.path}`);
  next();
});

// Get all public pensions
router.get('/pensions', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = 'SELECT * FROM pensions';
    const params = [];

    if (search) {
      query += ' WHERE (name LIKE ? OR description LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const pensionsResult = await executeQuery(query, params);

    // Map each pension to include its real packages and counts
    const items = await Promise.all(pensionsResult.map(async (p) => {
      const pensionId = p.pension_id;
      
      // Get real packages for this pension from packages table
      let packages = [];
      
      try {
        packages = await executeQuery(`
          SELECT pk.*, 
                 (SELECT COUNT(*) 
                  FROM rooms r 
                  WHERE r.pension_id = pk.pension_id 
                    AND r.package_id = pk.package_id
                    AND r.availability_status = 'Available') as availableRoomsCount
          FROM packages pk
          WHERE pk.pension_id = ?
          ORDER BY pk.created_at DESC
        `, [pensionId]);
        
        console.log('🔍 Public packages query result:', packages);
        console.log('🔍 Available rooms per package:', packages.map(pkg => ({ 
          name: pkg.name, 
          package_id: pkg.package_id,
          count: pkg.availableRoomsCount 
        })));
        
        // Debug: Check individual room-package relationships
        for (const pkg of packages) {
          const individualRooms = await executeQuery(`
            SELECT room_id, room_type, package_id, availability_status 
            FROM rooms 
            WHERE pension_id = ? AND package_id = ?
          `, [pensionId, pkg.package_id]);
          
          console.log(`🔍 Package "${pkg.name}" (ID: ${pkg.package_id}):`, {
            availableCount: pkg.availableRoomsCount,
            individualRooms: individualRooms.map(r => ({
              id: r.room_id,
              type: r.room_type,
              package_id: r.package_id,
              status: r.availability_status
            }))
          });
        }
      } catch (error) {
        console.log('Packages table error:', error.message);
      }

      const liveAvailableRooms = packages.reduce((sum, pkg) => sum + pkg.availableRoomsCount, 0);

      // Only include pension if it has available rooms
      if (liveAvailableRooms === 0) {
        console.log(`🔍 Pension ${p.name} excluded: No available rooms (${liveAvailableRooms} rooms)`);
        return null; // Skip this pension
      }

      // Get coordinates (use existing or geocode from address)
      let coordinates = { lat: p.latitude, lng: p.longitude };
      if (!p.latitude || !p.longitude) {
        try {
          coordinates = await geocodingService.geocodeAddress(p.address);
          console.log(`🗺️ Geocoded "${p.name}" address to:`, coordinates);
        } catch (error) {
          console.log(`⚠️ Geocoding failed for "${p.name}":`, error.message);
          coordinates = { lat: 9.03, lng: 38.74 }; // Default fallback
        }
      }

      return {
        id: pensionId.toString(),
        name: p.name,
        description: p.description,
        ownerInfo: p.owner_info || `Managed by property owner`,
        roomDetails: p.room_details || `${p.capacity || 0} rooms total`,
        locationName: p.address,
        city: p.address ? p.address.split(',')[0] : 'Addis Ababa',
        area: p.address ? p.address.split(',')[0] : 'Addis Ababa',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        availableRooms: liveAvailableRooms,
        images: [p.image_url || '/src/assets/room-1.png'],
        phone: p.phone || '',
        email: p.email || '',
        packages: packages.map(pkg => ({
          id: pkg.package_id || pkg.id,
          name: pkg.name,
          price: parseFloat(pkg.price),
          description: pkg.description,
          image: pkg.image_url || pkg.image || null,
          services: typeof pkg.services === 'string' ? JSON.parse(pkg.services) : (pkg.services || []),
          availableRooms: pkg.availableRoomsCount || 0,
          isMostPopular: pkg.is_most_popular === 1 || pkg.is_most_popular === true
        }))
      };
      
      console.log('🔍 Final package data with images:', packages.map(pkg => ({
        name: pkg.name,
        package_id: pkg.package_id,
        image: pkg.image,
        image_url: pkg.image_url,
        finalImage: pkg.image_url || pkg.image || null,
        availableRoomsCount: pkg.availableRoomsCount,
        availableRooms: pkg.availableRoomsCount || 0,
        image_urlType: typeof pkg.image_url,
        image_urlIsNull: pkg.image_url === null,
        image_urlUndefined: pkg.image_url === undefined
      })));
      
      console.log('🔍 Final package data available rooms for list:', packages.map(pkg => ({
        name: pkg.name,
        availableRooms: pkg.availableRoomsCount || 0
      })));
    }));

    // Filter out pensions with no available rooms
    const availableItems = items.filter(item => item !== null);
    console.log(`🔍 Total pensions: ${items.length}, Available pensions: ${availableItems.length}`);

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedItems = availableItems.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: availableItems.length,
          totalPages: Math.ceil(availableItems.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get public pensions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single public pension
router.get('/pensions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const pensionResult = await executeQuery('SELECT * FROM pensions WHERE pension_id = ?', [id]);
    if (pensionResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Pension not found' });
    }

    const p = pensionResult[0];
    
    // Get real packages (check both packages table and pensions.packages JSON)
    let packages = [];
    
    // First try to get from packages table
    try {
      packages = await executeQuery(`
        SELECT pk.*, 
               (SELECT COUNT(*) 
                FROM rooms r 
                WHERE r.pension_id = pk.pension_id 
                  AND r.package_id = pk.package_id
                  AND r.availability_status = 'Available') as availableRoomsCount
        FROM packages pk
        WHERE pk.pension_id = ?
      `, [id]);
    } catch (error) {
      console.log('Packages table not found or error:', error.message);
    }
    
    console.log('🔍 Single pension packages query result:', packages);
    console.log('🔍 Available rooms per package:', packages.map(pkg => ({ 
      name: pkg.name, 
      package_id: pkg.package_id,
      count: pkg.availableRoomsCount 
    })));
    
    // Debug: Check individual room-package relationships for single pension
    for (const pkg of packages) {
      const individualRooms = await executeQuery(`
        SELECT room_id, room_type, package_id, availability_status 
        FROM rooms 
        WHERE pension_id = ? AND package_id = ?
      `, [id, pkg.package_id]);
      
      console.log(`🔍 Single Pension Package "${pkg.name}" (ID: ${pkg.package_id}):`, {
        availableCount: pkg.availableRoomsCount,
        individualRooms: individualRooms.map(r => ({
          id: r.room_id,
          type: r.room_type,
          package_id: r.package_id,
          status: r.availability_status
        }))
      });
    }
    
    // If no packages in table, check pensions.packages JSON
    if (packages.length === 0 && p.packages) {
      try {
        const jsonPackages = typeof p.packages === 'string' ? JSON.parse(p.packages) : p.packages;
        
        // Calculate actual available rooms for each package
        const packagesWithAvailability = await Promise.all(
          jsonPackages.map(async (pkg) => {
            const availableRoomsCount = await executeQuery(`
              SELECT COUNT(*) as count
              FROM rooms r
              WHERE r.pension_id = ? 
                AND r.room_type = ? 
                AND r.availability_status = 'Available'
            `, [id, pkg.name]);
            
            const count = availableRoomsCount[0].count;
            console.log(`Single pension - Package ${pkg.name}: ${count} available rooms`);
            
            return {
              ...pkg,
              package_id: pkg.id,
              availableRoomsCount: count,
              isMostPopular: pkg.is_most_popular === 1 || pkg.is_most_popular === true // Include popular status
            };
          })
        );
        
        packages = packagesWithAvailability;
      } catch (error) {
        console.error('Error parsing pension packages JSON:', error);
      }
    }
    
    console.log(`Pension ${id} packages found:`, packages.length);
    console.log('Pension packages data:', packages);
    
    const liveAvailableRooms = packages.reduce((sum, pkg) => sum + pkg.availableRoomsCount, 0);

    // Check if pension has available rooms
    if (liveAvailableRooms === 0) {
      console.log(`🔍 Single pension ${id} excluded: No available rooms (${liveAvailableRooms} rooms)`);
      return res.status(404).json({ 
        success: false, 
        message: 'Pension not available - no rooms currently available' 
      });
    }

    // Get coordinates (use existing or geocode from address)
    let coordinates = { lat: p.latitude, lng: p.longitude };
    if (!p.latitude || !p.longitude) {
      try {
        coordinates = await geocodingService.geocodeAddress(p.address);
        console.log(`🗺️ Single pension geocoded "${p.name}" to:`, coordinates);
      } catch (error) {
        console.log(`⚠️ Single pension geocoding failed:`, error.message);
        coordinates = { lat: 9.03, lng: 38.74 }; // Default fallback
      }
    }

    const mappedPension = {
      id: p.pension_id.toString(),
      name: p.name,
      description: p.description,
      ownerInfo: p.owner_info || 'Professional hospitality service',
      roomDetails: p.room_details || `${p.capacity || 0} rooms available`,
      locationName: p.address,
      city: p.address,
      area: p.address ? p.address.split(',')[0] : 'Addis Ababa',
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      availableRooms: liveAvailableRooms,
      images: [p.image_url || '/src/assets/room-1.png'],
      phone: p.phone || '',
      email: p.email || '',
      packages: packages.map(pkg => ({
        id: pkg.package_id || pkg.id,
        name: pkg.name,
        price: parseFloat(pkg.price),
        description: pkg.description,
        image: pkg.image_url || pkg.image || null,
        services: typeof pkg.services === 'string' ? JSON.parse(pkg.services) : (pkg.services || []),
        availableRooms: pkg.availableRoomsCount || 0,
        isMostPopular: pkg.is_most_popular === 1 || pkg.is_most_popular === true
      }))
    };
    
    console.log('🔍 Single pension package images:', packages.map(pkg => ({
      name: pkg.name,
      package_id: pkg.package_id,
      image: pkg.image,
      image_url: pkg.image_url,
      finalImage: pkg.image_url || pkg.image || null,
      availableRoomsCount: pkg.availableRoomsCount,
      availableRooms: pkg.availableRoomsCount || 0
    })));
    
    console.log('🔍 Final package data available rooms:', packages.map(pkg => ({
      name: pkg.name,
      availableRooms: pkg.availableRoomsCount || 0
    })));

    res.json({
      success: true,
      data: mappedPension
    });
  } catch (error) {
    console.error('Get public pension error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test endpoint for debugging
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Public routes working' });
});

// Temporary fix endpoint to update package images
router.post('/fix-package-images/:pensionId', async (req, res) => {
  try {
    const { pensionId } = req.params;
    const { imageUpdates } = req.body; // [{packageId: 11, imageUrl: '/uploads/luxury.jpg'}, ...]
    
    console.log('🔧 Fixing package images:', imageUpdates);
    
    for (const update of imageUpdates) {
      await executeQuery(
        'UPDATE packages SET image_url = ? WHERE package_id = ? AND pension_id = ?',
        [update.imageUrl, update.packageId, pensionId]
      );
    }
    
    res.json({ success: true, message: 'Package images updated' });
  } catch (error) {
    console.error('Error fixing package images:', error);
    res.status(500).json({ success: false, message: 'Error updating package images' });
  }
});

// Create a new public booking
router.post('/bookings', upload.single('idDocument'), async (req, res) => {
  try {
    console.log('🔍 Raw booking request body:', req.body);
    console.log('🔍 Request file:', req.file);
    console.log('🔍 Request body keys:', Object.keys(req.body));
    console.log('🔍 File upload details:', {
      originalname: req.file?.originalname,
      filename: req.file?.filename,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });
    
    console.log('🔧 Starting booking process...');
    
    // When using FormData, fields come as strings
    const pensionId = req.body.pensionId;
    const packageName = req.body.packageName;
    const checkIn = req.body.checkIn;
    const checkOut = req.body.checkOut;
    const fullName = req.body.fullName;
    const phone = req.body.phone;
    const email = req.body.email;
    const specialRequests = req.body.specialRequests;
    const totalPrice = req.body.totalPrice;
    const quantity = req.body.rooms; // Note: frontend sends 'rooms' not 'quantity'

    const idDocumentUrl = req.file ? '/uploads/' + req.file.filename : null;

    console.log('🔍 Parsed booking data:', { 
      pensionId, 
      packageName, 
      checkIn, 
      checkOut, 
      fullName, 
      phone, 
      email, 
      specialRequests, 
      totalPrice, 
      quantity,
      idDocumentUrl,
      hasFile: !!req.file
    });

    // Validate required fields
    console.log('🔧 Validating fields:', {
      pensionId: !!pensionId,
      packageName: !!packageName,
      checkIn: !!checkIn,
      checkOut: !!checkOut,
      fullName: !!fullName,
      phone: !!phone,
      quantity: !!quantity
    });
    
    if (!pensionId || !packageName || !checkIn || !checkOut || !fullName || !phone || !quantity) {
      console.error('❌ Missing required fields:', {
        pensionId: !!pensionId,
        packageName: !!packageName,
        checkIn: !!checkIn,
        checkOut: !!checkOut,
        fullName: !!fullName,
        phone: !!phone,
        quantity: !!quantity
      });
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

    console.log('🔧 Fields validation passed');

    if (!idDocumentUrl) {
      console.error('❌ Missing ID document');
      return res.status(400).json({ success: false, message: 'ID Document is required' });
    }

    // Validate quantity
    const roomQuantity = parseInt(quantity);
    if (isNaN(roomQuantity) || roomQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Please select at least 1 room' });
    }

    // 1. Find or Create Customer
    let customerId;
    if (email) {
      try {
        const existingUser = await executeQuery('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
          customerId = existingUser[0].user_id;
        }
      } catch (error) {
        console.log('Error checking existing user:', error.message);
      }
    }
    
    if (!customerId) {
      try {
        const newUser = await executeQuery(
          `INSERT INTO users (full_name, email, phone, role, status) VALUES (?, ?, ?, 'Customer', 'Approved')`,
          [fullName, email || null, phone]
        );
        customerId = newUser.insertId;
      } catch (error) {
        console.error('Error creating user:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to create customer record' });
      }
    }

    // 2. Get package info and check availability
    try {
      console.log('Looking for package:', { pensionId, packageName });
      
      // First check if packages are stored in pensions.packages JSON
      const pensionResult = await executeQuery(`
        SELECT packages FROM pensions WHERE pension_id = ?
      `, [pensionId]);
      
      let allPackages = [];
      if (pensionResult.length > 0 && pensionResult[0].packages) {
        try {
          allPackages = typeof pensionResult[0].packages === 'string' 
            ? JSON.parse(pensionResult[0].packages) 
            : pensionResult[0].packages;
        } catch (error) {
          console.error('Error parsing pension packages JSON:', error);
        }
      }
      
      // Also check the separate packages table
      const tablePackages = await executeQuery(`
        SELECT * FROM packages WHERE pension_id = ?
      `, [pensionId]);
      
      if (tablePackages.length > 0) {
        allPackages = [...allPackages, ...tablePackages];
      }
      
      console.log('Available packages:', allPackages);
      
      // Also check what room types exist
      const roomTypes = await executeQuery(`
        SELECT DISTINCT room_type FROM rooms WHERE pension_id = ?
      `, [pensionId]);
      
      console.log('Available room types:', roomTypes);
      
      // Find the requested package
      const foundPackage = allPackages.find(p => 
        p.name === packageName || 
        (p.package_name && p.package_name === packageName) ||
        p.name?.toLowerCase() === packageName?.toLowerCase()
      );
      
      if (!foundPackage) {
        console.log('Package not found with name:', packageName);
        return res.status(400).json({ 
          success: false, 
          message: `Package '${packageName}' not found. Available packages: ${allPackages.map(p => p.name || p.package_name).filter(Boolean).join(', ')}` 
        });
      }
      
      console.log('Found package:', foundPackage);

      // Calculate available rooms for this package type
      const availableRoomsResult = await executeQuery(`
        SELECT COUNT(*) as availableRoomsCount
        FROM rooms 
        WHERE pension_id = ? AND package_id = ? AND availability_status = 'Available'
      `, [pensionId, foundPackage.package_id]);

      const availableRooms = availableRoomsResult[0].availableRoomsCount || 0;
      console.log(`Available rooms for ${packageName}: ${availableRooms}`);
      
      if (availableRooms < roomQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${availableRooms} room(s) available for this package.` 
        });
      }

      // 3. Create booking record
      const pricePerRoom = parseFloat(totalPrice) / roomQuantity;
      
      // Get the room_id and room_number for the booking
      const roomForBooking = await executeQuery(`
        SELECT room_id, room_number FROM rooms 
        WHERE pension_id = ? AND package_id = ? AND availability_status = 'Available'
        LIMIT ?
      `, [pensionId, foundPackage.package_id, roomQuantity]);
      
      if (roomForBooking.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No rooms available for booking' 
        });
      }
      
      const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const bookingResult = await executeQuery(`
        INSERT INTO bookings (room_id, room_number, customer_id, check_in_date, check_out_date, total_price, status, created_at, id_document_url, pass_code)
        VALUES (?, ?, ?, ?, ?, ?, 'Confirmed', NOW(), ?, ?)
      `, [roomForBooking[0].room_id, roomForBooking[0].room_number, customerId, checkIn, checkOut, totalPrice, idDocumentUrl, passCode]);

      const bookingId = bookingResult.insertId;

      // Send notification to pension owner
      try {
        console.log('🔧 Attempting to send notification for booking:', bookingId);
        
        // Get pension owner info
        const ownerResult = await executeQuery(`
          SELECT p.owner_id, u.email as owner_email
          FROM pensions p
          JOIN users u ON p.owner_id = u.user_id
          WHERE p.pension_id = ?
        `, [pensionId]);

        console.log('🔧 Owner query result:', ownerResult);

        if (ownerResult.length > 0) {
          const owner = ownerResult[0];
          
          const notificationTitle = 'New Booking Received';
          const notificationMessage = `${fullName} booked Room ${roomForBooking[0].room_number} for ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}`;
          
          console.log('🔧 Creating notification:', {
            owner_id: owner.owner_id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'new_booking'
          });
          
          await notificationService.createAndSendNotification(
            owner.owner_id,
            notificationTitle,
            notificationMessage,
            'new_booking',
            'New Booking Received'
          );
          
          console.log('✅ New booking notification sent to owner:', owner.owner_id);
        } else {
          console.log('⚠️ No owner found for pension:', pensionId);
        }
      } catch (notificationError) {
        console.error('❌ Failed to send booking notification:', notificationError);
        console.error('❌ Full error details:', notificationError.stack);
        // Don't fail the booking if notification fails
      }

      // 4. Update room availability - mark rooms as occupied
      const roomsToBook = await executeQuery(`
        SELECT room_id FROM rooms 
        WHERE pension_id = ? AND package_id = ? AND availability_status = 'Available'
        LIMIT ?
      `, [pensionId, foundPackage.package_id, roomQuantity]);

      if (roomsToBook.length < roomQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${roomsToBook.length} room(s) available for this package.` 
        });
      }

      // Mark rooms as occupied
      for (const room of roomsToBook) {
        await executeQuery(`
          UPDATE rooms 
          SET availability_status = 'Occupied', last_status_update = NOW()
          WHERE room_id = ?
        `, [room.room_id]);
      }

      console.log(`Marked ${roomsToBook.length} rooms as occupied for package ${packageName}`);

      res.json({
        success: true,
        message: 'Booking created successfully',
        data: {
          bookingId,
          bookingIds: [bookingId],
          customer: { fullName, phone, email: email || '' },
          booking: {
            id: bookingId,
            status: 'Confirmed',
            checkIn,
            checkOut,
            totalPrice,
            packageName,
            passCode,
            roomNumber: roomForBooking[0].room_number  // Add room number to response
          }
        }
      });
    } catch (error) {
      console.error('Error in booking process:', error.message);
      console.error('Full error:', error);
      return res.status(500).json({ success: false, message: 'Failed to process booking: ' + error.message });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get booking status
router.get('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting booking status for ID:', id);

    // Query the actual booking from database
    const bookingResult = await executeQuery(`
      SELECT b.*, u.full_name, u.email, u.phone, p.name as pension_name, r.room_type
      FROM bookings b
      JOIN users u ON b.customer_id = u.user_id
      JOIN rooms r ON b.room_id = r.room_id
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE b.booking_id = ?
    `, [id]);

    if (bookingResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult[0];
    
    res.json({
      success: true,
      data: {
        status: booking.status,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: booking.total_price,
        room_type: booking.room_type,
        pension_name: booking.pension_name,
        package_name: booking.room_type // Use room_type as package name
      }
    });
  } catch (error) {
    console.error('Get booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
