import * as express from 'express';
import { authenticateToken } from '../middleware/auth';
import availabilityService from '../services/availabilityService';

const router = express.Router();

// Check-in guest
router.post('/check-in/:bookingId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user.userId;
    const { actualCheckIn, earlyCheckIn, notes } = req.body;

    const result = await availabilityService.checkInGuest({
      bookingId: parseInt(bookingId),
      actualCheckIn,
      earlyCheckIn,
      notes,
      staffId
    });

    res.json(result);

  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check in guest'
    });
  }
});

// Check-out guest
router.post('/check-out/:bookingId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user.userId;
    const { actualCheckOut, earlyCheckOut, notes } = req.body;

    const result = await availabilityService.checkOutGuest({
      bookingId: parseInt(bookingId),
      actualCheckOut,
      earlyCheckOut,
      notes,
      staffId
    });

    res.json(result);

  } catch (error: any) {
    console.error('Check-out error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check out guest'
    });
  }
});

// Manual availability update (admin override)
router.put('/rooms/:roomId/availability', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { roomId } = req.params;
    const staffId = req.user.userId;
    const { newStatus, reason, bookingId } = req.body;

    // Validate status
    if (!['Available', 'Occupied', 'Maintenance', 'Blocked'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status'
      });
    }

    const result = await availabilityService.updateRoomAvailability({
      roomId: parseInt(roomId),
      newStatus,
      reason,
      staffId,
      bookingId: bookingId ? parseInt(bookingId) : undefined
    });

    res.json(result);

  } catch (error: any) {
    console.error('Availability update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update room availability'
    });
  }
});

// Get availability history for a room
router.get('/rooms/:roomId/history', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { roomId } = req.params;
    const { limit = 50 } = req.query;

    const result = await availabilityService.getAvailabilityHistory(
      parseInt(roomId), 
      parseInt(limit as string)
    );

    res.json(result);

  } catch (error: any) {
    console.error('Get availability history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability history'
    });
  }
});

// Bulk availability update
router.put('/rooms/bulk-availability', authenticateToken as any, async (req: any, res: any) => {
  try {
    const staffId = req.user.userId;
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    // Add staff ID to each update
    const updatesWithStaff = updates.map(update => ({
      ...update,
      staffId
    }));

    const result = await availabilityService.bulkUpdateAvailability(updatesWithStaff);

    res.json(result);

  } catch (error: any) {
    console.error('Bulk availability update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update room availability'
    });
  }
});

// Get rooms needing attention (early check-ins, pending check-outs, etc.)
router.get('/attention-needed/:pensionId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { pensionId } = req.params;

    const result = await availabilityService.getRoomsNeedingAttention(parseInt(pensionId));

    res.json(result);

  } catch (error: any) {
    console.error('Get rooms needing attention error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rooms needing attention'
    });
  }
});

// Quick check-in (for confirmed bookings)
router.post('/quick-check-in', authenticateToken as any, async (req: any, res: any) => {
  try {
    const staffId = req.user.userId;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const result = await availabilityService.checkInGuest({
      bookingId: parseInt(bookingId),
      staffId
    });

    res.json(result);

  } catch (error: any) {
    console.error('Quick check-in error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check in guest'
    });
  }
});

// Quick check-out (for active bookings)
router.post('/quick-check-out', authenticateToken as any, async (req: any, res: any) => {
  try {
    const staffId = req.user.userId;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const result = await availabilityService.checkOutGuest({
      bookingId: parseInt(bookingId),
      staffId
    });

    res.json(result);

  } catch (error: any) {
    console.error('Quick check-out error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check out guest'
    });
  }
});

export default router;
