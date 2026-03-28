const express = require('express');
const { executeQuery } = require('../config/database');
const upload = require('../middleware/upload');

const router = express.Router();

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
                    AND r.room_type = pk.name 
                    AND r.availability_status = 'Available') as availableRoomsCount
          FROM packages pk
          WHERE pk.pension_id = ?
          ORDER BY pk.created_at DESC
        `, [pensionId]);
        
        console.log('🔍 Public packages query result:', packages);
        console.log('🔍 Available rooms per package:', packages.map(pkg => ({ name: pkg.name, count: pkg.availableRoomsCount })));
      } catch (error) {
        console.log('Packages table error:', error.message);
      }

      const liveAvailableRooms = packages.reduce((sum, pkg) => sum + pkg.availableRoomsCount, 0);

      return {
        id: pensionId.toString(),
        name: p.name,
        description: p.description,
        ownerInfo: p.owner_info || `Managed by property owner`,
        roomDetails: p.room_details || `${p.capacity || 0} rooms total`,
        locationName: p.address,
        city: p.address ? p.address.split(',')[0] : 'Addis Ababa',
        area: p.address ? p.address.split(',')[0] : 'Addis Ababa',
        latitude: p.latitude || 9.03,
        longitude: p.longitude || 38.74,
        availableRooms: liveAvailableRooms,
        images: [p.image_url || '/src/assets/room-1.png'],
        phone: p.phone || '',
        email: p.email || '',
        packages: packages.map(pkg => ({
          id: pkg.package_id || pkg.id,
          name: pkg.name,
          price: parseFloat(pkg.price),
          description: pkg.description,
          image: pkg.image || pkg.image_url || '/src/assets/package-101-standard.png',
          services: typeof pkg.services === 'string' ? JSON.parse(pkg.services) : (pkg.services || []),
          availableRooms: pkg.availableRoomsCount || 0, // Use calculated value, not static one
          isMostPopular: pkg.isMostPopular || false // Include popular status
        }))
      };
    }));

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: items.length,
          totalPages: Math.ceil(items.length / parseInt(limit))
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
                  AND r.room_type = pk.name 
                  AND r.availability_status = 'Available') as availableRoomsCount
        FROM packages pk
        WHERE pk.pension_id = ?
      `, [id]);
    } catch (error) {
      console.log('Packages table not found or error:', error.message);
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
              isMostPopular: pkg.isMostPopular || false // Include popular status
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

    const mappedPension = {
      id: p.pension_id.toString(),
      name: p.name,
      description: p.description,
      ownerInfo: p.owner_info || 'Professional hospitality service',
      roomDetails: p.room_details || `${p.capacity || 0} rooms available`,
      locationName: p.address,
      city: p.address,
      area: p.address ? p.address.split(',')[0] : 'Addis Ababa',
      latitude: p.latitude || 9.03,
      longitude: p.longitude || 38.74,
      availableRooms: liveAvailableRooms,
      images: [p.image_url || '/src/assets/room-1.png'],
      phone: p.phone || '',
      email: p.email || '',
      packages: packages.map(pkg => ({
        id: pkg.package_id || pkg.id,
        name: pkg.name,
        price: parseFloat(pkg.price),
        description: pkg.description,
        image: pkg.image_url || pkg.image || '/src/assets/package-101-standard.png',
        services: typeof pkg.services === 'string' ? JSON.parse(pkg.services) : (pkg.services || []),
        availableRooms: pkg.availableRoomsCount || 0, // Use calculated value, not static one
        isMostPopular: pkg.isMostPopular || false // Include popular status
      }))
    };

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

// Create a new public booking
router.post('/bookings', upload.single('idDocument'), async (req, res) => {
  try {
    const { 
      pensionId, packageName, checkIn, checkOut, 
      fullName, phone, email, specialRequests, totalPrice, rooms: quantity 
    } = req.body;

    const idDocumentUrl = req.file ? '/uploads/' + req.file.filename : null;

    console.log('Booking request:', { pensionId, packageName, quantity });

    // Validate required fields
    if (!pensionId || !packageName || !checkIn || !checkOut || !fullName || !phone || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

    if (!idDocumentUrl) {
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
        WHERE pension_id = ? AND room_type = ? AND availability_status = 'Available'
      `, [pensionId, packageName]);

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
      
      // Get the room_id for the booking
      const roomForBooking = await executeQuery(`
        SELECT room_id FROM rooms 
        WHERE pension_id = ? AND room_type = ? AND availability_status = 'Available'
        LIMIT 1
      `, [pensionId, packageName]);
      
      if (roomForBooking.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No rooms available for booking' 
        });
      }
      
      const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const bookingResult = await executeQuery(`
        INSERT INTO bookings (room_id, customer_id, check_in_date, check_out_date, total_price, status, created_at, id_document_url, pass_code)
        VALUES (?, ?, ?, ?, ?, 'Confirmed', NOW(), ?, ?)
      `, [roomForBooking[0].room_id, customerId, checkIn, checkOut, totalPrice, idDocumentUrl, passCode]);

      const bookingId = bookingResult.insertId;

      // 4. Update room availability - mark rooms as occupied
      const roomsToBook = await executeQuery(`
        SELECT room_id FROM rooms 
        WHERE pension_id = ? AND room_type = ? AND availability_status = 'Available'
        LIMIT ?
      `, [pensionId, packageName, roomQuantity]);

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
            passCode
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
