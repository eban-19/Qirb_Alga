import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import notificationService from '../services/notificationService';

const router = express.Router();

// Get bookings for user (protected)
router.get('/', authenticateToken as any, async (req: any, res: any, next: any) => {
  try {
    const { page = 1, limit = 10, status, pension_id } = req.query;
    const userId = req.user.userId;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT b.*, 
             u.full_name as user_name, u.email as user_email, u.phone as user_phone,
             r.pension_id, r.room_type, r.price_per_night, r.room_number
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status as string);
    }

    if (pension_id) {
      query += ' AND r.pension_id = ?';
      params.push(pension_id as string);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), offset);

    const bookings = await executeQuery(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.room_id
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    
    const countParams = [userId];

    if (status) {
      countQuery += ' AND b.status = ?';
      countParams.push(status as string);
    }

    if (pension_id) {
      countQuery += ' AND r.pension_id = ?';
      countParams.push(pension_id as string);
    }

    const countResult = await executeQuery(countQuery, countParams);

    res.json({
      success: true,
      data: {
        items: bookings,
        total: countResult[0]?.total || 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    next(error);
  }
});

// Get single booking
router.get('/:bookingId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await executeQuery(`
      SELECT b.*, 
             u.full_name as user_name, u.email as user_email, u.phone as user_phone,
             r.pension_id, r.room_type, r.price_per_night, r.room_number,
             p.name as pension_name, p.address as pension_address
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE b.booking_id = ? AND p.owner_id = ?
    `, [bookingId, userId]);

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
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Create new booking
router.post('/', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const {
      room_id,
      check_in_date,
      check_out_date,
      special_requests
    } = req.body;

    // Validate input
    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, and check-out date are required'
      });
    }

    // Check if room exists and is available
    const room = await executeQuery(
      'SELECT * FROM rooms WHERE room_id = ? AND is_available = TRUE',
      [room_id]
    );

    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    // Check if room is available for the requested dates
    const existingBooking = await executeQuery(`
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND status IN ('Confirmed', 'Pending')
      AND (
        (check_in_date <= ? AND check_out_date >= ?) OR
        (check_in_date <= ? AND check_out_date >= ?) OR
        (check_in_date >= ? AND check_out_date <= ?)
      )
    `, [room_id, check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date]);

    if (existingBooking.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for these dates'
      });
    }

    // Calculate total price
    const nights = Math.ceil((new Date(check_out_date).getTime() - new Date(check_in_date).getTime()) / (1000 * 60 * 60 * 24));
    const total_price = nights * room[0].price_per_night;

    // Create booking
    const result = await executeQuery(`
      INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_price, special_requests, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `, [userId, room_id, check_in_date, check_out_date, total_price, special_requests]);

    // Send notification to pension owner
    const ownerQuery = await executeQuery(`
      SELECT p.owner_id, u.email, u.full_name 
      FROM pensions p
      LEFT JOIN users u ON p.owner_id = u.user_id
      WHERE p.pension_id = ?
    `, [room[0].pension_id]);

    if (ownerQuery.length > 0) {
      await notificationService.createNotification({
        user_id: ownerQuery[0].owner_id,
        title: 'New Booking Request',
        message: `A new booking request has been made for ${room[0].room_type} from ${check_in_date} to ${check_out_date}`,
        type: 'booking'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: result.insertId,
        room_id,
        check_in_date,
        check_out_date,
        total_price,
        status: 'Pending'
      }
    });

  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// Update booking status
router.put('/:bookingId/status', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const { status } = req.body;

    if (!['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if booking exists and belongs to user's pension
    const booking = await executeQuery(`
      SELECT b.*, p.owner_id
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.room_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE b.booking_id = ? AND p.owner_id = ?
    `, [bookingId, userId]);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status
    await executeQuery(
      'UPDATE bookings SET status = ?, updated_at = NOW() WHERE booking_id = ?',
      [status, bookingId]
    );

    // Send notification to customer
    await notificationService.createNotification({
      user_id: booking[0].customer_id,
      title: `Booking ${status}`,
      message: `Your booking has been ${status.toLowerCase()}`,
      type: 'booking'
    });

    res.json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`
    });

  } catch (error: any) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

// Cancel booking (customer can cancel their own bookings)
router.delete('/:bookingId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // Check if booking exists and belongs to user
    const booking = await executeQuery(
      'SELECT * FROM bookings WHERE booking_id = ? AND customer_id = ?',
      [bookingId, userId]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking[0].status === 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel confirmed booking'
      });
    }

    // Update booking status to cancelled
    await executeQuery(
      'UPDATE bookings SET status = ?, updated_at = NOW() WHERE booking_id = ?',
      ['Cancelled', bookingId]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

export default router;
