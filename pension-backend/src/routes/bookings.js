const express = require('express');
const { executeQuery, executeTransaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get bookings for user (protected)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, pension_id } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
             u.full_name as user_name, u.email as user_email, u.phone as user_phone,
             r.pension_id, r.room_type, r.price_per_night
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (pension_id) {
      query += ' AND r.pension_id = ?';
      params.push(pension_id);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const bookingsResult = await executeQuery(query, params);
    
    const normalizedBookings = bookingsResult.map(b => ({
      ...b,
      id: b.booking_id,
      user_id: b.customer_id
    }));

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN rooms r ON b.room_id = r.room_id
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    const countParams = [userId];

    if (status) {
      countQuery += ' AND b.status = ?';
      countParams.push(status);
    }
    if (pension_id) {
      countQuery += ' AND r.pension_id = ?';
      countParams.push(pension_id);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        items: normalizedBookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    next(error);
  }
});

// Create new booking
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { room_id, package_id, check_in_date, check_out_date, total_price } = req.body;
    const userId = req.user.userId;

    if (!room_id || !check_in_date || !check_out_date || !total_price) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, check-out date, and total price are required'
      });
    }

    const result = await executeQuery(
      `INSERT INTO bookings (customer_id, room_id, package_id, check_in_date, check_out_date, total_price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, room_id, package_id, check_in_date, check_out_date, total_price]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    next(error);
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check ownership
    const booking = await executeQuery(
      `SELECT b.* FROM bookings b 
       JOIN rooms r ON b.room_id = r.room_id 
       JOIN pensions p ON r.pension_id = p.pension_id 
       WHERE b.booking_id = ? AND p.owner_id = ?`,
      [id, userId]
    );

    if (booking.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await executeQuery('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, id]);
    
    // If status is cancelled or completed, make room available
    if (['cancelled', 'completed'].includes(status)) {
      const roomUpdateQuery = 'UPDATE rooms SET availability_status = "Available", last_status_update = NOW() WHERE room_id = ?';
      await executeQuery(roomUpdateQuery, [booking[0].room_id]);
      
      // Log the availability change
      const logQuery = 'INSERT INTO RoomAvailabilityLogs (room_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)';
      await executeQuery(logQuery, [booking[0].room_id, 'Occupied', 'Available', userId]);
    } else if (status === 'confirmed') {
      // If confirmed, make room occupied
      const roomUpdateQuery = 'UPDATE rooms SET availability_status = "Occupied", last_status_update = NOW() WHERE room_id = ?';
      await executeQuery(roomUpdateQuery, [booking[0].room_id]);
      
      // Log the availability change
      const logQuery = 'INSERT INTO RoomAvailabilityLogs (room_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)';
      await executeQuery(logQuery, [booking[0].room_id, 'Available', 'Occupied', userId]);
    }

    res.json({ success: true, message: 'Booking status updated' });
  } catch (error) {
    console.error('Update booking error:', error);
    next(error);
  }
});

// Complete booking early (guest leaves early)
router.post('/:id/complete-early', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check ownership and current status
    const booking = await executeQuery(
      `SELECT b.*, r.pension_id FROM bookings b 
       JOIN rooms r ON b.room_id = r.room_id 
       JOIN pensions p ON r.pension_id = p.pension_id 
       WHERE b.booking_id = ? AND p.owner_id = ?`,
      [id, userId]
    );

    if (booking.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    if (booking[0].status.toLowerCase() !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Only confirmed bookings can be completed early' });
    }

    const queries = [
      {
        query: 'UPDATE bookings SET status = "completed" WHERE booking_id = ?',
        params: [id]
      },
      {
        query: 'UPDATE rooms SET availability_status = "Available", last_status_update = NOW() WHERE room_id = ?',
        params: [booking[0].room_id]
      },
      {
        query: 'INSERT INTO RoomAvailabilityLogs (room_id, old_status, new_status, changed_by) VALUES (?, "Occupied", "Available", ?)',
        params: [booking[0].room_id, userId]
      }
    ];

    await executeTransaction(queries);

    res.json({ 
      success: true, 
      message: 'Booking completed early and room is now available' 
    });
  } catch (error) {
    console.error('Complete early booking error:', error);
    next(error);
  }
});

module.exports = router;
