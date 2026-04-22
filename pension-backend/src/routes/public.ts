import * as express from 'express';
import { executeQuery, executeTransaction, pool } from '../config/database';
import upload from '../middleware/upload';
import * as path from 'path';
import * as fs from 'fs';
import notificationService from '../services/notificationService';
import geocodingService from '../services/geocoding';

const router = express.Router();

interface Package {
  id: number | string;
  name: string;
  price: number;
  description: string;
  image?: string | null;
  services: any[];
  availableRooms: number;
  isMostPopular: boolean;
  package_id?: number;
  availableRoomsCount?: number;
  image_url?: string | null;
  is_most_popular?: number | boolean;
}

interface Pension {
  id: string;
  name: string;
  description: string;
  ownerInfo: string;
  roomDetails: string;
  locationName: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  availableRooms: number;
  images: string[];
  phone: string;
  email: string;
  packages: Package[];
}

// Debug middleware to log all requests to public routes
router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`Public route: ${req.method} ${req.path}`);
  next();
});

// Get all public pensions
router.get('/pensions', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Debug: Check all pensions and their statuses
    const allPensionsQuery = `
      SELECT p.pension_id, p.name, p.status, op.approval_status, op.owner_id
      FROM pensions p
      LEFT JOIN ownerprofiles op ON p.owner_id = op.owner_id
      ORDER BY p.created_at DESC
    `;
    const allPensionsResult = await executeQuery(allPensionsQuery);
    console.log('🔍 All pensions debug:', allPensionsResult);

    let query = `
      SELECT p.*, op.business_name, op.approval_status 
      FROM pensions p
      LEFT JOIN ownerprofiles op ON p.owner_id = op.owner_id
      WHERE LOWER(p.status) = ? AND LOWER(op.approval_status) = ?
    `;
    const params: any[] = ['active', 'approved'];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    console.log('🔍 Public pensions query:', query);
    console.log('🔍 Public pensions params:', params);
    const pensionsResult = await executeQuery(query, params);
    console.log('🔍 Public pensions result:', pensionsResult);

    // Map each pension to include its real packages and counts
    const items = await Promise.all(pensionsResult.map(async (p: any) => {
      const pensionId = p.pension_id;
      
      // Get real packages for this pension from packages table
      let packages: any[] = [];
      
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
        console.log('🔍 Available rooms per package:', packages.map((pkg: any) => ({ 
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
            individualRooms: individualRooms.map((r: any) => ({
              id: r.room_id,
              type: r.room_type,
              package_id: r.package_id,
              status: r.availability_status
            }))
          });
        }
      } catch (error: any) {
        console.log('Packages table error:', (error as Error).message);
      }

      const liveAvailableRooms = packages.reduce((sum: number, pkg: any) => sum + pkg.availableRoomsCount, 0);

      // Only include pension if it has available rooms
      if (liveAvailableRooms === 0) {
        console.log(`🔍 Pension ${p.name} excluded: No available rooms (${liveAvailableRooms} rooms)`);
        return null; // Skip this pension
      }

      // Get coordinates (use existing or geocode from address)
      let coordinates = { 
        lat: parseFloat(p.latitude) || null, 
        lng: parseFloat(p.longitude) || null 
      };
      
      // If coordinates are invalid (null, NaN, or 0), geocode from address
      if (!coordinates.lat || !coordinates.lng || isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
        try {
          coordinates = await geocodingService.geocodeAddress(p.address);
          console.log(`🗺️ Geocoded "${p.name}" address to:`, coordinates);
        } catch (error: any) {
          console.log(`⚠️ Geocoding failed for "${p.name}":`, (error as Error).message);
          coordinates = { lat: 9.03, lng: 38.74 }; // Default fallback
        }
      } else {
        console.log(`✅ Using existing coordinates for "${p.name}":`, coordinates);
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
        image_url: p.image_url, // Add this field for frontend compatibility
        phone: p.phone || '',
        email: p.email || '',
        packages: packages.map((pkg: any): Package => ({
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
    }));

    // Filter out pensions with no available rooms
    const availableItems = items.filter(item => item !== null);
    console.log(`🔍 Total pensions: ${items.length}, Available pensions: ${availableItems.length}`);

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedItems = availableItems.slice(startIndex, startIndex + parseInt(limit as string));

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: availableItems.length,
          totalPages: Math.ceil(availableItems.length / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    console.error('Get public pensions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single public pension
router.get('/pensions/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;

    const pensionResult = await executeQuery(`
      SELECT p.*, op.business_name, op.approval_status 
      FROM pensions p
      LEFT JOIN ownerprofiles op ON p.owner_id = op.owner_id
      WHERE p.pension_id = ? AND p.status = ? AND op.approval_status = ?
    `, [id, 'active', 'Approved']);
    if (pensionResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Pension not found' });
    }

    const p = pensionResult[0];
    
    // Get real packages (check both packages table and pensions.packages JSON)
    let packages: any[] = [];
    
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
    } catch (error: any) {
      console.log('Packages table not found or error:', (error as Error).message);
    }
    
    console.log('🔍 Single pension packages query result:', packages);
    console.log('🔍 Available rooms per package:', packages.map((pkg: any) => ({ 
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
        individualRooms: individualRooms.map((r: any) => ({
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
          jsonPackages.map(async (pkg: any) => {
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
      } catch (error: any) {
        console.error('Error parsing pension packages JSON:', error);
      }
    }
    
    console.log(`Pension ${id} packages found:`, packages.length);
    console.log('Pension packages data:', packages);
    
    const liveAvailableRooms = packages.reduce((sum: number, pkg: any) => sum + pkg.availableRoomsCount, 0);

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
      } catch (error: any) {
        console.log(`⚠️ Single pension geocoding failed:`, (error as Error).message);
        coordinates = { lat: 9.03, lng: 38.74 }; // Default fallback
      }
    }

    const mappedPension: Pension = {
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
      packages: packages.map((pkg: any): Package => ({
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

    res.json({
      success: true,
      data: mappedPension
    });
  } catch (error: any) {
    console.error('Get public pension error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test endpoint for debugging
router.get('/test', (req: express.Request, res: express.Response) => {
  res.json({ success: true, message: 'Public routes working' });
});

// Create a new public booking
router.post('/bookings', upload.single('idDocument'), async (req: any, res: express.Response) => {
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
    let customerId: number | undefined;
    if (phone) {
      try {
        const existingUser = await executeQuery('SELECT user_id FROM users WHERE phone = ?', [phone]);
        if (existingUser.length > 0) {
          customerId = existingUser[0].user_id;
        }
      } catch (error: any) {
        console.log('Error checking existing user:', (error as Error).message);
      }
    }
    
    if (!customerId) {
      try {
        // Create customer without email - only name, phone, and role
        const newUser = await executeQuery(
          `INSERT INTO users (full_name, phone, role, status, password_hash) VALUES (?, ?, 'Customer', 'Approved', '')`,
          [fullName, phone]
        );
        customerId = newUser.insertId;
      } catch (error: any) {
        console.error('Error creating user:', (error as Error).message);
        console.error('Full error details:', error);
        console.error('Error stack:', (error as Error).stack);
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
      
      let allPackages: any[] = [];
      if (pensionResult.length > 0 && pensionResult[0].packages) {
        try {
          allPackages = typeof pensionResult[0].packages === 'string' 
            ? JSON.parse(pensionResult[0].packages) 
            : pensionResult[0].packages;
        } catch (error: any) {
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
      
      // Find the requested package
      const foundPackage = allPackages.find((p: any) => 
        p.name === packageName || 
        (p.package_name && p.package_name === packageName) ||
        p.name?.toLowerCase() === packageName?.toLowerCase()
      );
      
      if (!foundPackage) {
        console.log('Package not found with name:', packageName);
        return res.status(400).json({ 
          success: false, 
          message: `Package '${packageName}' not found. Available packages: ${allPackages.map((p: any) => p.name || p.package_name).filter(Boolean).join(', ')}` 
        });
      }
      
      console.log('Found package:', foundPackage);

      // Start transaction for atomic booking
      const connection = await pool.getConnection();
      let bookingId: number;
      let roomNumber: string;
      
      try {
        await connection.beginTransaction();

        // 1. Check for date conflicts with existing bookings (same as walk-in booking)
        const conflictCheck = await connection.query(`
          SELECT COUNT(*) as conflictCount
          FROM bookings b
          JOIN rooms r ON b.room_id = r.room_id
          WHERE r.pension_id = ? AND r.package_id = ?
          AND b.status IN ('Confirmed', 'Pending')
          AND (
            (b.check_in_date <= ? AND b.check_out_date >= ?) OR
            (b.check_in_date <= ? AND b.check_out_date >= ?) OR
            (b.check_in_date >= ? AND b.check_out_date <= ?)
          )
        `, [pensionId, foundPackage.package_id, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]);

        const conflictCount = (conflictCheck[0] as any)[0].conflictCount;
        console.log(`Date conflict check for package ${packageName}: ${conflictCount} conflicts`);

        // Calculate available rooms considering both availability_status and date conflicts
        const availableRoomsResult = await connection.query(`
          SELECT COUNT(*) as availableRoomsCount
          FROM rooms r
          WHERE r.pension_id = ? AND r.package_id = ? AND r.availability_status = 'Available'
          AND r.room_id NOT IN (
            SELECT DISTINCT b.room_id
            FROM bookings b
            WHERE b.status IN ('Confirmed', 'Pending')
            AND (
              (b.check_in_date <= ? AND b.check_out_date >= ?) OR
              (b.check_in_date <= ? AND b.check_out_date >= ?) OR
              (b.check_in_date >= ? AND b.check_out_date <= ?)
            )
          )
        `, [pensionId, foundPackage.package_id, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]);

        const availableRooms = (availableRoomsResult[0] as any)[0].availableRoomsCount || 0;
        console.log(`Available rooms for ${packageName} after date check: ${availableRooms}`);
        
        if (availableRooms < roomQuantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ 
            success: false, 
            message: `Only ${availableRooms} room(s) available for these dates.` 
          });
        }

        // 2. Get and lock the room using SELECT FOR UPDATE
        const roomForBookingResult = await connection.query(`
          SELECT room_id, room_number FROM rooms 
          WHERE pension_id = ? AND package_id = ? AND availability_status = 'Available'
          AND room_id NOT IN (
            SELECT DISTINCT b.room_id
            FROM bookings b
            WHERE b.status IN ('Confirmed', 'Pending')
            AND (
              (b.check_in_date <= ? AND b.check_out_date >= ?) OR
              (b.check_in_date <= ? AND b.check_out_date >= ?) OR
              (b.check_in_date >= ? AND b.check_out_date <= ?)
            )
          )
          LIMIT 1
          FOR UPDATE
        `, [pensionId, foundPackage.package_id, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]);

        const roomForBooking = (roomForBookingResult[0] as any);
        
        if (!roomForBooking || roomForBooking.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ 
            success: false, 
            message: 'No rooms available for booking' 
          });
        }

        const selectedRoom = roomForBooking[0];
        
        // 3. Create booking record (row is already locked by SELECT FOR UPDATE)
        const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const bookingResult = await connection.query(`
          INSERT INTO bookings (room_id, room_number, customer_id, check_in_date, check_out_date, total_price, status, created_at, id_document_url, pass_code, booking_source)
          VALUES (?, ?, ?, ?, ?, ?, 'Confirmed', NOW(), ?, ?, 'App')
        `, [selectedRoom.room_id, selectedRoom.room_number, customerId, checkIn, checkOut, totalPrice, idDocumentUrl, passCode]);

        bookingId = (bookingResult[0] as any).insertId;
        roomNumber = selectedRoom.room_number;

        // 4. Mark room as Occupied (booking is confirmed)
        await connection.query(`
          UPDATE rooms 
          SET availability_status = 'Occupied', last_status_update = NOW()
          WHERE room_id = ?
        `, [selectedRoom.room_id]);

        // Commit transaction
        await connection.commit();
        connection.release();
        console.log(`✅ Transaction committed for booking ${bookingId}`);

      } catch (transactionError: any) {
        await connection.rollback();
        connection.release();
        console.error('❌ Transaction failed:', transactionError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to process booking: ' + transactionError.message 
        });
      }

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
          const notificationMessage = `${fullName} booked Room ${roomNumber} for ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}`;
          
          console.log('🔧 Creating notification:', {
            owner_id: owner.owner_id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'new_booking'
          });
          
          await notificationService.createNotification({
            user_id: owner.owner_id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'new_booking'
          });
          
          console.log('✅ New booking notification sent to owner:', owner.owner_id);
        } else {
          console.log('⚠️ No owner found for pension:', pensionId);
        }
      } catch (notificationError: any) {
        console.error('❌ Failed to send booking notification:', notificationError);
        console.error('❌ Full error details:', (notificationError as Error).stack);
        // Don't fail the booking if notification fails
      }

      // Regenerate passCode for response (it was generated inside transaction)
      const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();

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
            roomNumber: roomNumber
          }
        }
      });
    } catch (error: any) {
      console.error('Error in booking process:', (error as Error).message);
      console.error('Full error:', error);
      return res.status(500).json({ success: false, message: 'Failed to process booking: ' + (error as Error).message });
    }
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get booking status
router.get('/bookings/:id/status', async (req: express.Request, res: express.Response) => {
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
  } catch (error: any) {
    console.error('Get booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Walk-In Booking Endpoint
router.post('/walk-in-bookings', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    console.log('=== WALK-IN BOOKING REQUEST ===');
    console.log('Request body:', req.body);
    
    const { 
      pensionId, packageName, guestName, phoneNumber, checkIn, checkOut 
    } = req.body;

    console.log('Walk-in booking data:', {
      pensionId, packageName, guestName, phoneNumber, checkIn, checkOut
    });

    // Validate required fields
    if (!pensionId || !packageName || !guestName || !phoneNumber || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['pensionId', 'packageName', 'guestName', 'phoneNumber', 'checkIn', 'checkOut']
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Allow same-day check-in for walk-ins (just prevent past dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Check if pension exists and is active
    const pensionCheck = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND status = "active"',
      [pensionId]
    );

    if (pensionCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found or not active'
      });
    }

    // Check package exists for this pension
    const packageCheck = await executeQuery(
      'SELECT * FROM packages WHERE pension_id = ? AND name = ?',
      [pensionId, packageName]
    );

    if (packageCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found for this pension'
      });
    }

    const packageData = packageCheck[0];
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Use package original price without commission
    const totalPrice = packageData.price * nights;

    // Start transaction for atomic booking
    const connection = await pool.getConnection();
    let bookingId: number;
    let roomNumber: string;
    
    try {
      await connection.beginTransaction();

      // Find and lock available room using SELECT FOR UPDATE
      const availableRoomResult = await connection.query(`
        SELECT r.* FROM rooms r
        LEFT JOIN bookings b ON r.room_id = b.room_id
        WHERE r.pension_id = ? AND r.availability_status = 'Available'
        AND (
          b.room_id IS NULL OR
          b.status NOT IN ('Confirmed', 'Pending') OR
          (b.check_in_date > ? OR b.check_out_date < ?)
        )
        LIMIT 1
        FOR UPDATE
      `, [pensionId, checkOut, checkIn]);

      const availableRoom = (availableRoomResult[0] as any);

      if (!availableRoom || availableRoom.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'No available rooms for the selected dates'
        });
      }

      const selectedRoom = availableRoom[0];

      // Create walk-in booking (no user account needed) (row is already locked by SELECT FOR UPDATE)
      const bookingResult = await connection.query(`
        INSERT INTO bookings (room_id, room_number, check_in_date, check_out_date, total_price, status, created_at, walk_in_guest_name, walk_in_guest_phone, booking_source)
        VALUES (?, ?, ?, ?, ?, 'Confirmed', NOW(), ?, ?, 'Walk-In')
      `, [selectedRoom.room_id, selectedRoom.room_number, checkIn, checkOut, totalPrice, guestName, phoneNumber]);

      bookingId = (bookingResult[0] as any).insertId;
      roomNumber = selectedRoom.room_number;

      // Mark room as Occupied (booking is confirmed)
      await connection.query(`
        UPDATE rooms 
        SET availability_status = 'Occupied', last_status_update = NOW()
        WHERE room_id = ?
      `, [selectedRoom.room_id]);

      // Commit transaction
      await connection.commit();
      connection.release();
      console.log(`✅ Walk-in transaction committed for booking ${bookingId}`);

    } catch (transactionError: any) {
      await connection.rollback();
      connection.release();
      console.error('❌ Walk-in transaction failed:', transactionError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to process walk-in booking: ' + transactionError.message 
      });
    }

    console.log('✅ Walk-in booking created:', {
      bookingId,
      pensionId,
      packageName,
      guestName,
      phoneNumber,
      checkIn,
      checkOut,
      totalPrice
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in booking created successfully',
      data: {
        bookingId,
        roomNumber,
        pensionName: pensionCheck[0].name,
        packageName,
        checkIn,
        checkOut,
        totalPrice,
        status: 'Confirmed',
        guestInfo: {
          guestName,
          phoneNumber
        },
        bookingSource: 'Walk-In'
      }
    });

  } catch (error: any) {
    console.error('❌ Walk-in booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create walk-in booking'
    });
  }
});

export default router;
