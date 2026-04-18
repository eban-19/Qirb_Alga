import { executeQuery } from '../config/database';
import notificationService from './notificationService';

class BookingService {
  /**
   * Complete a booking checkout (reusable logic for both manual and automatic checkout)
   * This is the single source of truth for checkout logic
   * 
   * @param bookingId - The booking ID to complete
   * @param isAutomatic - Whether this is an automatic checkout (true) or manual early checkout (false)
   * @returns Object with success status and data
   */
  async completeBookingCheckout(bookingId: number, isAutomatic: boolean = false) {
    try {
      console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT STARTED:`, { bookingId });

      // Get booking details with room and pension info
      const booking = await executeQuery(`
        SELECT b.*, r.room_id, r.availability_status, r.pension_id, p.owner_id
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN pensions p ON r.pension_id = p.pension_id
        WHERE b.booking_id = ?
      `, [bookingId]);

      if (booking.length === 0) {
        console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT BLOCKED: Booking not found`);
        return {
          success: false,
          message: 'Booking not found'
        };
      }

      const bookingData = booking[0];
      console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT BOOKING DATA:`, {
        bookingId: bookingData.booking_id,
        status: bookingData.status,
        checkOutDate: bookingData.check_out_date,
        actualCheckOut: bookingData.actual_check_out
      });

      // IDEMPOTENCY CHECK: If already completed, skip
      if (bookingData.status === 'Completed') {
        console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT SKIPPED: Booking already completed`);
        return {
          success: true,
          message: 'Booking already completed',
          skipped: true
        };
      }

      // IDEMPOTENCY CHECK: If already checked out, skip
      if (bookingData.actual_check_out) {
        console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT SKIPPED: Already checked out`);
        return {
          success: true,
          message: 'Already checked out',
          skipped: true
        };
      }

      // Update booking status and set actual checkout time
      await executeQuery(`
        UPDATE bookings 
        SET status = 'Completed',
            actual_check_out = NOW(),
            updated_at = NOW()
        WHERE booking_id = ?
      `, [bookingId]);

      console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT: Booking updated successfully`);

      // Update room availability to Available
      try {
        await executeQuery(`
          UPDATE rooms 
          SET availability_status = 'Available',
              last_status_update = NOW()
          WHERE room_id = ?
        `, [bookingData.room_id]);
        console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT: Room updated successfully`);
      } catch (roomErr) {
        console.error(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT: Room update failed:`, roomErr);
        // Do NOT let room update failure break checkout
      }

      // Send notification to pension owner (only for manual checkout to avoid spam)
      if (!isAutomatic && bookingData.owner_id) {
        try {
          await notificationService.createNotification({
            user_id: bookingData.owner_id,
            title: 'Booking Completed',
            message: `Booking #${bookingId} has been completed and room is now available`,
            type: 'checkout'
          });
        } catch (notifErr) {
          console.error('Notification failed:', notifErr);
          // Do NOT let notification failure break checkout
        }
      }

      console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT COMPLETED SUCCESSFULLY`);

      return {
        success: true,
        message: isAutomatic ? 'Booking automatically completed' : 'Booking completed successfully',
        data: {
          bookingId: bookingId,
          completedAt: new Date().toISOString(),
          isAutomatic
        }
      };

    } catch (error: any) {
      console.error(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT ERROR:`, error);
      return {
        success: false,
        message: error.message || 'Checkout failed',
        error: error.stack
      };
    }
  }

  /**
   * Get bookings that are overdue for checkout
   * Returns bookings where check_out_date has passed but actual_check_out is not set
   */
  async getOverdueCheckouts() {
    try {
      const overdueBookings = await executeQuery(`
        SELECT 
          b.booking_id,
          b.status,
          b.check_out_date,
          b.actual_check_out,
          r.room_id,
          r.availability_status,
          p.pension_id,
          p.name as pension_name
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN pensions p ON r.pension_id = p.pension_id
        WHERE b.status IN ('Confirmed', 'Pending')
          AND b.check_out_date < NOW()
          AND b.actual_check_out IS NULL
          AND b.actual_check_in IS NOT NULL
        ORDER BY b.check_out_date ASC
      `);

      return {
        success: true,
        data: overdueBookings,
        count: overdueBookings.length
      };
    } catch (error: any) {
      console.error('Error fetching overdue checkouts:', error);
      return {
        success: false,
        message: error.message,
        data: [],
        count: 0
      };
    }
  }
}

export default new BookingService();
