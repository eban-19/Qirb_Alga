const express = require('express');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Create a new public booking
router.post('/bookings', async (req, res, next) => {
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
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

    // Check for empty strings (treat as missing)
    if (!pensionId.trim() || !packageName.trim() || !checkIn.trim() || !checkOut.trim() || !fullName.trim() || !phone.trim()) {
      console.log('Empty string fields detected:', {
        pensionId: pensionId?.trim(),
        packageName: packageName?.trim(),
        checkIn: checkIn?.trim(),
        checkOut: checkOut?.trim(),
        fullName: fullName?.trim(),
        phone: phone?.trim()
      });
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Validate quantity
    const roomQuantity = parseInt(quantity);
    if (isNaN(roomQuantity) || roomQuantity < 1) {
      console.log('Invalid quantity:', { quantity, parsed: roomQuantity });
      return res.status(400).json({ success: false, message: 'Please select at least 1 room' });
    }

    // 1. Find or Create Customer
    let customerId;
    if (email) {
      const existingUser = await executeQuery('SELECT user_id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        customerId = existingUser[0].user_id;
      }
    }
    
    if (!customerId) {
      const newUser = await executeQuery(
        `INSERT INTO users (full_name, email, phone, role, status) VALUES (?, ?, ?, 'Customer', 'Approved')`,
        [fullName, email || null, phone]
      );
      customerId = newUser.insertId;
    }

    // 2. Find Available Rooms matching Pension and Package (Room Type)
    console.log('Finding rooms with:', { pensionId, packageName, roomQuantity });
    
    // First, let's see what room types exist for this pension
    const allRooms = await executeQuery(`
      SELECT room_id, room_type, availability_status FROM rooms 
      WHERE pension_id = ?
    `, [pensionId]);
    
    console.log('All rooms for pension:', allRooms);
    
    // If no rooms exist, use the package's availableRooms count
    if (allRooms.length === 0) {
      console.log('No rooms in database, using package available rooms count');
      
      // Get the package to check its available rooms
      const packageResult = await executeQuery(`
        SELECT availableRoomsCount FROM packages 
        WHERE pension_id = ? AND name = ?
      `, [pensionId, packageName]);
      
      const packageAvailableRooms = packageResult.length > 0 ? packageResult[0].availableRoomsCount : 0;
      console.log('Package available rooms:', packageAvailableRooms);
      
      if (packageAvailableRooms < roomQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${packageAvailableRooms} room(s) available for this package.` 
        });
      }
      
      // Create dummy room data for booking
      const dummyRooms = Array.from({ length: roomQuantity }, (_, i) => ({ 
        room_id: `temp_${Date.now()}_${i}` 
      }));
      
      console.log('Using dummy rooms for booking:', dummyRooms);
      await createBookingsWithRooms(dummyRooms, customerId, checkIn, checkOut, parseFloat(totalPrice) / roomQuantity, res, fullName, phone, email);
      return;
    }
    
    const availableRooms = await executeQuery(`
      SELECT room_id, room_type FROM rooms 
      WHERE pension_id = ? AND room_type = ? AND availability_status = 'Available'
      LIMIT ?
    `, [pensionId, packageName, roomQuantity]);

    console.log('Available rooms found:', availableRooms);
    console.log('Room count needed:', roomQuantity);

    if (availableRooms.length < roomQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${availableRooms.length} room(s) available for this package.` 
      });
    }

    // Calculate price per room
    const pricePerRoom = parseFloat(totalPrice) / roomQuantity;

    await createBookingsWithRooms(availableRooms, customerId, checkIn, checkOut, pricePerRoom, res, fullName, phone, email);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Helper function to create bookings
async function createBookingsWithRooms(roomsToBook, customerId, checkIn, checkOut, pricePerRoom, res, fullName, phone, email) {
  // 3. Create Bookings and Update Room Statuses
  const bookingIds = [];
  for (const room of roomsToBook) {
    const bookResult = await executeQuery(`
      INSERT INTO bookings (room_id, customer_id, check_in_date, check_out_date, total_price, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'Pending', NOW())
    `, [room.room_id, customerId, checkIn, checkOut, pricePerRoom]);
    
    bookingIds.push(bookResult.insertId);
  }

  const bookingResult = await executeQuery(`
    SELECT b.*, u.full_name, u.email, u.phone, p.name as pension_name
    FROM bookings b
    JOIN users u ON b.customer_id = u.user_id
    JOIN pensions p ON p.pension_id = ?
    WHERE b.booking_id IN (${bookingIds.join(',')})
    ORDER BY b.booking_id DESC
    LIMIT 1
  `, [roomsToBook[0].room_id.includes('temp_') ? 5 : roomsToBook[0].room_id.split('_')[0]]);

  res.json({
    success: true,
    message: 'Booking created successfully',
    data: {
      bookingId: bookingIds[0].toString(),
      bookingIds: bookingIds,
      customer: {
        fullName,
        phone,
        email: email || ''
      },
      booking: bookingResult[0]
    }
  });
}

module.exports = router;
