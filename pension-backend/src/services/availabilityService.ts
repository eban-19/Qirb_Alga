import { executeQuery } from '../config/database';
import notificationService from './notificationService';

export interface CheckInData {
  bookingId: number;
  actualCheckIn?: string;
  earlyCheckIn?: boolean;
  notes?: string;
  staffId: number;
}

export interface CheckOutData {
  bookingId: number;
  actualCheckOut?: string;
  earlyCheckOut?: boolean;
  notes?: string;
  staffId: number;
}

export interface AvailabilityUpdateData {
  roomId: number;
  newStatus: 'Available' | 'Occupied' | 'Maintenance' | 'Blocked';
  reason?: string;
  staffId: number;
  bookingId?: number;
}

class AvailabilityService {
  // Check-in guest
  async checkInGuest(data: CheckInData) {
    try {
      // Get booking details
      const booking = await executeQuery(`
        SELECT b.*, r.room_id, r.availability_status, r.pension_id
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.booking_id = ?
      `, [data.bookingId]);

      if (booking.length === 0) {
        throw new Error('Booking not found');
      }

      const bookingData = booking[0];

      // Validate booking status
      if (bookingData.status !== 'Confirmed') {
        throw new Error('Booking must be confirmed before check-in');
      }

      // Check if already checked in
      if (bookingData.actual_check_in) {
        throw new Error('Guest already checked in');
      }

      const now = data.actualCheckIn || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const isEarly = data.earlyCheckIn || (new Date(now) < new Date(bookingData.check_in_date));

      // Update booking with check-in details
      await executeQuery(`
        UPDATE bookings 
        SET actual_check_in = ?, 
            early_check_in = ?,
            check_in_by = ?,
            status = 'Confirmed'
        WHERE booking_id = ?
      `, [now, isEarly ? 1 : 0, data.staffId, data.bookingId]);

      // Update room status
      const oldStatus = bookingData.availability_status;
      if (oldStatus !== 'Occupied') {
        await executeQuery(`
          UPDATE rooms 
          SET availability_status = 'Occupied',
              last_status_update = NOW()
          WHERE room_id = ?
        `, [bookingData.room_id]);

        // Log availability change
        await this.logAvailabilityChange({
          roomId: bookingData.room_id,
          oldStatus,
          newStatus: 'Occupied',
          changedBy: data.staffId,
          reason: data.notes || `Guest check-in${isEarly ? ' (early)' : ''}`,
          bookingId: data.bookingId
        });
      }

      // Send notification to pension owner
      await notificationService.createNotification({
        user_id: await this.getPensionOwnerId(bookingData.pension_id),
        title: 'Guest Checked In',
        message: `Guest has checked in to ${bookingData.room_type}${isEarly ? ' (early check-in)' : ''}`,
        type: 'checkin'
      });

      return {
        success: true,
        message: 'Guest checked in successfully',
        data: {
          bookingId: data.bookingId,
          checkInTime: now,
          earlyCheckIn: isEarly
        }
      };

    } catch (error: any) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  // Check-out guest
  async checkOutGuest(data: CheckOutData) {
    try {
      // Get booking details
      const booking = await executeQuery(`
        SELECT b.*, r.room_id, r.availability_status, r.pension_id
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.booking_id = ?
      `, [data.bookingId]);

      if (booking.length === 0) {
        throw new Error('Booking not found');
      }

      const bookingData = booking[0];

      // Validate booking status
      if (!['Confirmed', 'Completed'].includes(bookingData.status)) {
        throw new Error('Invalid booking status for check-out');
      }

      // Check if already checked out
      if (bookingData.actual_check_out) {
        throw new Error('Guest already checked out');
      }

      const now = data.actualCheckOut || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const isEarly = data.earlyCheckOut || (new Date(now) < new Date(bookingData.check_out_date));

      // Update booking with check-out details
      await executeQuery(`
        UPDATE bookings 
        SET actual_check_out = ?, 
            early_check_out = ?,
            check_out_by = ?,
            status = 'Completed'
        WHERE booking_id = ?
      `, [now, isEarly ? 1 : 0, data.staffId, data.bookingId]);

      // Update room status to Available (no maintenance for now)
      const oldStatus = bookingData.availability_status;
      if (oldStatus !== 'Available') {
        await executeQuery(`
          UPDATE rooms 
          SET availability_status = 'Available',
              last_status_update = NOW()
          WHERE room_id = ?
        `, [bookingData.room_id]);

        // Log availability change
        await this.logAvailabilityChange({
          roomId: bookingData.room_id,
          oldStatus,
          newStatus: 'Available',
          changedBy: data.staffId,
          reason: data.notes || `Guest check-out${isEarly ? ' (early)' : ''}`,
          bookingId: data.bookingId
        });
      }

      // Send notification to pension owner
      await notificationService.createNotification({
        user_id: await this.getPensionOwnerId(bookingData.pension_id),
        title: 'Guest Checked Out',
        message: `Guest has checked out from ${bookingData.room_type}${isEarly ? ' (early check-out)' : ''}`,
        type: 'checkout'
      });

      return {
        success: true,
        message: 'Guest checked out successfully',
        data: {
          bookingId: data.bookingId,
          checkOutTime: now,
          earlyCheckOut: isEarly
        }
      };

    } catch (error: any) {
      console.error('Check-out error:', error);
      throw error;
    }
  }

  // Manual availability update (admin override)
  async updateRoomAvailability(data: AvailabilityUpdateData) {
    try {
      // Get current room status
      const room = await executeQuery(`
        SELECT room_id, availability_status, pension_id
        FROM rooms
        WHERE room_id = ?
      `, [data.roomId]);

      if (room.length === 0) {
        throw new Error('Room not found');
      }

      const oldStatus = room[0].availability_status;

      // Update room status
      await executeQuery(`
        UPDATE rooms 
        SET availability_status = ?,
            last_status_update = NOW()
        WHERE room_id = ?
      `, [data.newStatus, data.roomId]);

      // Log availability change
      await this.logAvailabilityChange({
        roomId: data.roomId,
        oldStatus,
        newStatus: data.newStatus,
        changedBy: data.staffId,
        reason: data.reason || 'Manual admin override',
        bookingId: data.bookingId
      });

      return {
        success: true,
        message: 'Room availability updated successfully',
        data: {
          roomId: data.roomId,
          oldStatus,
          newStatus: data.newStatus
        }
      };

    } catch (error: any) {
      console.error('Availability update error:', error);
      throw error;
    }
  }

  // Get availability history
  async getAvailabilityHistory(roomId: number, limit: number = 50) {
    try {
      const history = await executeQuery(`
        SELECT ah.*, u.full_name as changed_by_name
        FROM availability_history ah
        LEFT JOIN users u ON ah.changed_by = u.user_id
        WHERE ah.room_id = ?
        ORDER BY ah.created_at DESC
        LIMIT ?
      `, [roomId, limit]);

      return {
        success: true,
        data: history
      };

    } catch (error: any) {
      console.error('Get availability history error:', error);
      throw error;
    }
  }

  // Bulk availability update
  async bulkUpdateAvailability(updates: AvailabilityUpdateData[]) {
    try {
      const results = [];

      for (const update of updates) {
        try {
          const result = await this.updateRoomAvailability(update);
          results.push(result);
        } catch (error: any) {
          results.push({
            success: false,
            roomId: update.roomId,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Processed ${updates.length} availability updates`,
        data: results
      };

    } catch (error: any) {
      console.error('Bulk availability update error:', error);
      throw error;
    }
  }

  // Get rooms needing attention (early check-ins, etc.)
  async getRoomsNeedingAttention(pensionId: number) {
    try {
      const rooms = await executeQuery(`
        SELECT 
          r.room_id,
          r.room_type,
          r.availability_status,
          r.pension_id,
          b.booking_id,
          b.customer_id,
          b.check_in_date,
          b.check_out_date,
          b.actual_check_in,
          b.actual_check_out,
          b.early_check_in,
          b.early_check_out,
          u.full_name as customer_name,
          DATEDIFF(b.check_in_date, CURDATE()) as days_until_checkin,
          DATEDIFF(b.check_out_date, CURDATE()) as days_until_checkout
        FROM rooms r
        LEFT JOIN bookings b ON r.room_id = b.room_id 
          AND b.status IN ('Confirmed', 'Completed')
          AND b.actual_check_in IS NULL
        LEFT JOIN users u ON b.customer_id = u.user_id
        WHERE r.pension_id = ?
        ORDER BY 
          CASE 
            WHEN b.check_in_date <= CURDATE() AND b.actual_check_in IS NULL THEN 1
            WHEN b.check_out_date <= CURDATE() AND b.actual_check_out IS NULL THEN 2
            ELSE 3
          END,
          b.check_in_date ASC
      `, [pensionId]);

      return {
        success: true,
        data: rooms
      };

    } catch (error: any) {
      console.error('Get rooms needing attention error:', error);
      throw error;
    }
  }

  // Helper methods
  private async logAvailabilityChange(data: {
    roomId: number;
    oldStatus: string;
    newStatus: string;
    changedBy: number;
    reason: string;
    bookingId?: number;
  }) {
    await executeQuery(`
      INSERT INTO availability_history 
      (room_id, old_status, new_status, changed_by, reason, booking_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [data.roomId, data.oldStatus, data.newStatus, data.changedBy, data.reason, data.bookingId]);
  }

  private async getPensionOwnerId(pensionId: number): Promise<number> {
    const result = await executeQuery(`
      SELECT owner_id FROM pensions WHERE pension_id = ?
    `, [pensionId]);
    
    return result[0]?.owner_id || 0;
  }
}

export default new AvailabilityService();
