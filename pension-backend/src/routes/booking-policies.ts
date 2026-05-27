import * as express from 'express';
import prisma from '../lib/prisma';
import { CancellationType, Prisma } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get the booking policy for a pension
router.get('/:pensionId', authenticateToken, async (req: any, res) => {
  try {
    const pensionId = parseInt(req.params.pensionId);

    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pensionId },
      select: { owner_id: true }
    });

    if (!pension) {
      return res.status(404).json({ success: false, message: 'Pension not found' });
    }

    if (pension.owner_id !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    let policy = await prisma.bookingPolicy.findUnique({
      where: { pension_id: pensionId }
    });

    // If no policy exists, create a default one
    if (!policy) {
      policy = await prisma.bookingPolicy.create({
        data: { pension_id: pensionId }
      });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Error fetching booking policy:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking policy' });
  }
});

// Update the booking policy for a pension
router.put('/:pensionId', authenticateToken, async (req: any, res) => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    
    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pensionId },
      select: { owner_id: true }
    });

    if (!pension || (pension.owner_id !== req.user.userId && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const {
      booking_window_start, booking_window_end, max_advance_days, min_advance_hours,
      allow_same_day, same_day_cutoff, min_stay_nights, max_stay_nights,
      check_in_start_time, check_in_end_time, check_out_time,
      cancellation_type, free_cancellation_hours, cancellation_penalty_percent,
      instant_booking, allow_children, allow_pets, allow_smoking,
      is_active
    } = req.body;

    const policy = await prisma.bookingPolicy.upsert({
      where: { pension_id: pensionId },
      update: {
        booking_window_start: booking_window_start ? new Date(booking_window_start) : null,
        booking_window_end: booking_window_end ? new Date(booking_window_end) : null,
        max_advance_days,
        min_advance_hours,
        allow_same_day: allow_same_day !== undefined ? allow_same_day : true,
        same_day_cutoff,
        min_stay_nights,
        max_stay_nights,
        check_in_start_time,
        check_in_end_time,
        check_out_time,
        cancellation_type,
        free_cancellation_hours,
        cancellation_penalty_percent,
        instant_booking: instant_booking !== undefined ? instant_booking : true,
        allow_children: allow_children !== undefined ? allow_children : true,
        allow_pets: allow_pets !== undefined ? allow_pets : false,
        allow_smoking: allow_smoking !== undefined ? allow_smoking : false,
        is_active: is_active !== undefined ? is_active : true
      },
      create: {
        pension_id: pensionId,
        booking_window_start: booking_window_start ? new Date(booking_window_start) : null,
        booking_window_end: booking_window_end ? new Date(booking_window_end) : null,
        max_advance_days,
        min_advance_hours,
        allow_same_day: allow_same_day !== undefined ? allow_same_day : true,
        same_day_cutoff,
        min_stay_nights,
        max_stay_nights,
        check_in_start_time,
        check_in_end_time,
        check_out_time,
        cancellation_type,
        free_cancellation_hours,
        cancellation_penalty_percent,
        instant_booking: instant_booking !== undefined ? instant_booking : true,
        allow_children: allow_children !== undefined ? allow_children : true,
        allow_pets: allow_pets !== undefined ? allow_pets : false,
        allow_smoking: allow_smoking !== undefined ? allow_smoking : false,
        is_active: is_active !== undefined ? is_active : true
      }
    });

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Error updating booking policy:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking policy' });
  }
});

// GET Blackout Dates
router.get('/:pensionId/blackout-dates', authenticateToken, async (req: any, res) => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    
    // Check access
    const pension = await prisma.pension.findUnique({ where: { pension_id: pensionId }, select: { owner_id: true } });
    if (!pension || (pension.owner_id !== req.user.userId && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const dates = await prisma.blackoutDate.findMany({
      where: { pension_id: pensionId },
      orderBy: { start_date: 'asc' }
    });

    res.json({ success: true, data: dates });
  } catch (error) {
    console.error('Error fetching blackout dates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE Blackout Date
router.post('/:pensionId/blackout-dates', authenticateToken, async (req: any, res) => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    
    const pension = await prisma.pension.findUnique({ where: { pension_id: pensionId }, select: { owner_id: true } });
    if (!pension || (pension.owner_id !== req.user.userId && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { start_date, end_date, room_id, reason } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required' });
    }

    const newDate = await prisma.blackoutDate.create({
      data: {
        pension_id: pensionId,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        room_id: room_id ? parseInt(room_id) : null,
        reason
      }
    });

    res.status(201).json({ success: true, data: newDate });
  } catch (error) {
    console.error('Error creating blackout date:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE Blackout Date
router.delete('/:pensionId/blackout-dates/:id', authenticateToken, async (req: any, res) => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    const id = parseInt(req.params.id);
    
    const pension = await prisma.pension.findUnique({ where: { pension_id: pensionId }, select: { owner_id: true } });
    if (!pension || (pension.owner_id !== req.user.userId && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await prisma.blackoutDate.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting blackout date:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
