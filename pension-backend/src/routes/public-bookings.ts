import * as express from 'express';
import { executeQuery } from '../config/database';

const router = express.Router();

// Create a new public booking
router.post('/bookings', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    console.log('=== BOOKING REQUEST DEBUG ===');
    console.log('Request body:', req.body);
    
    const { 
      pensionId, packageName, checkIn, checkOut, 
      fullName, phone, email, specialRequests, totalPrice, rooms: quantity 
    } = req.body;

    console.log('Extracted values:', {
      pensionId, packageName, checkIn, checkOut, 
      fullName, phone, email, specialRequests, totalPrice, quantity
    });

    if (!pensionId || !packageName || !checkIn || !checkOut || !fullName || !phone || !quantity) {
      console.log('Missing required fields:', {
        pensionId: !!pensionId,
        packageName: !!packageName,
        checkIn: !!checkIn,
        checkOut: !!checkOut,
        fullName: !!fullName,
        phone: !!phone,
        quantity: !!quantity
      });
      
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['pensionId', 'packageName', 'checkIn', 'checkOut', 'fullName', 'phone', 'quantity']
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

    if (checkInDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be in the future'
      });
    }

    // Check if pension exists
    const pensionCheck = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND status = "Approved"',
      [pensionId]
    );

    if (pensionCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found or not approved'
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

    // Calculate total price if not provided
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const calculatedTotal = packageData.price_per_night * nights * quantity;
    const finalTotal = totalPrice || calculatedTotal;

    // Check room availability
    const availabilityCheck = await executeQuery(`
      SELECT COUNT(*) as booked_rooms
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.room_id
      WHERE r.pension_id = ? 
      AND b.status IN ('Confirmed', 'Pending')
      AND (
        (b.check_in_date <= ? AND b.check_out_date >= ?) OR
        (b.check_in_date <= ? AND b.check_out_date >= ?) OR
        (b.check_in_date >= ? AND b.check_out_date <= ?)
      )
    `, [pensionId, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]);

    const bookedRooms = availabilityCheck[0].booked_rooms;
    const totalRooms = await executeQuery(
      'SELECT COUNT(*) as total FROM rooms WHERE pension_id = ? AND is_available = TRUE',
      [pensionId]
    );

    if (bookedRooms + quantity > totalRooms[0].total) {
      return res.status(400).json({
        success: false,
        message: 'Not enough rooms available for the selected dates',
        available: totalRooms[0].total - bookedRooms,
        requested: quantity
      });
    }

    // Create or get user
    let userId: number;
    if (email) {
      // Check if user exists
      const existingUser = await executeQuery(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        userId = existingUser[0].user_id;
      } else {
        // Create new user
        const newUser = await executeQuery(
          'INSERT INTO users (email, full_name, phone, role, status, created_at) VALUES (?, ?, ?, "customer", "Active", NOW())',
          [email, fullName, phone]
        );
        userId = newUser.insertId;
      }
    } else {
      // For bookings without email, use a guest user ID (you might want to handle this differently)
      userId = 0; // You might want to create a guest user or handle this case
    }

    // Find available room
    const availableRoom = await executeQuery(`
      SELECT r.* FROM rooms r
      LEFT JOIN bookings b ON r.room_id = b.room_id
      WHERE r.pension_id = ? AND r.is_available = TRUE
      AND (
        b.room_id IS NULL OR
        b.status NOT IN ('Confirmed', 'Pending') OR
        (b.check_in_date > ? OR b.check_out_date < ?)
      )
      LIMIT 1
    `, [pensionId, checkOut, checkIn]);

    if (availableRoom.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No available rooms found for the selected dates'
      });
    }

    // Create booking
    const bookingResult = await executeQuery(`
      INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_price, special_requests, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `, [userId, availableRoom[0].room_id, checkIn, checkOut, finalTotal, specialRequests]);

    const bookingId = bookingResult.insertId;

    console.log('✅ Booking created successfully:', {
      bookingId,
      userId,
      pensionId,
      packageName,
      checkIn,
      checkOut,
      totalPrice: finalTotal
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId,
        pensionName: pensionCheck[0].name,
        packageName,
        checkIn,
        checkOut,
        totalPrice: finalTotal,
        status: 'Pending',
        customerInfo: {
          fullName,
          phone,
          email
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get available rooms for a pension and dates
router.get('/availability', async (req: express.Request, res: express.Response) => {
  try {
    const { pensionId, checkIn, checkOut } = req.query;

    if (!pensionId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: pensionId, checkIn, checkOut'
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Get available rooms
    const availableRooms = await executeQuery(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM bookings b 
              WHERE b.room_id = r.room_id 
              AND b.status IN ('Confirmed', 'Pending')
              AND (b.check_in_date <= ? AND b.check_out_date >= ?)
             ) as booked_count
      FROM rooms r
      WHERE r.pension_id = ? AND r.is_available = TRUE
      ORDER BY r.room_number
    `, [checkOut, checkIn, pensionId]);

    // Filter rooms that are not fully booked
    const available = availableRooms.filter((room: any) => room.booked_count < 1);

    res.json({
      success: true,
      data: {
        availableRooms: available,
        totalAvailable: available.length
      }
    });

  } catch (error: any) {
    console.error('❌ Availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability'
    });
  }
});

// Get booking status
router.get('/bookings/:bookingId', async (req: express.Request, res: express.Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await executeQuery(`
      SELECT b.*, p.name as pension_name, p.address as pension_address,
             r.room_type, r.room_number, r.price_per_night,
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.room_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      LEFT JOIN users u ON b.customer_id = u.user_id
      WHERE b.booking_id = ?
    `, [bookingId]);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking[0]
    });

  } catch (error: any) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking'
    });
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

    if (checkInDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be in future'
      });
    }

    // Check if pension exists and is approved
    const pensionCheck = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND status = "Approved"',
      [pensionId]
    );

    if (pensionCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found or not approved'
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
    const totalPrice = packageData.price_per_night * nights;

    // Find available room
    const availableRoom = await executeQuery(`
      SELECT r.* FROM rooms r
      LEFT JOIN bookings b ON r.room_id = b.room_id
      WHERE r.pension_id = ? AND r.is_available = TRUE
      AND (
        b.room_id IS NULL OR
        b.status NOT IN ('Confirmed', 'Pending') OR
        (b.check_in_date > ? OR b.check_out_date < ?)
      )
      LIMIT 1
    `, [pensionId, checkOut, checkIn, checkIn, checkOut]);

    if (availableRoom.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No available rooms for the selected dates'
      });
    }

    // Create walk-in booking (no user account needed)
    const bookingResult = await executeQuery(`
      INSERT INTO bookings (room_id, check_in_date, check_out_date, total_price, special_requests, status, created_at, walk_in_guest_name, walk_in_guest_phone, booking_source)
      VALUES (?, ?, ?, ?, ?, 'Pending', NOW(), ?, ?, ?, 'Walk-In')
    `, [availableRoom[0].room_id, checkIn, checkOut, totalPrice, null, guestName, phoneNumber]);

    const bookingId = bookingResult.insertId;

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
        pensionName: pensionCheck[0].name,
        packageName,
        checkIn,
        checkOut,
        totalPrice,
        status: 'Pending',
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
