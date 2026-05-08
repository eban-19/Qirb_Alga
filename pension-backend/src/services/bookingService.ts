import prisma from '../lib/prisma';
import notificationService from './notificationService';
import { BookingStatus, RoomStatus } from '@prisma/client';

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
      const bookingData = await prisma.booking.findUnique({
        where: { booking_id: bookingId },
        include: {
          room: {
            include: {
              pension: {
                select: { owner_id: true }
              }
            }
          }
        }
      });

      if (!bookingData) {
        console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT BLOCKED: Booking not found`);
        return {
          success: false,
          message: 'Booking not found'
        };
      }

      // IDEMPOTENCY CHECK: If already completed or checked out, skip
      if (bookingData.status === BookingStatus.Completed || bookingData.actual_check_out) {
        console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT SKIPPED: Already completed or checked out`);
        return {
          success: true,
          message: 'Booking already completed or checked out',
          skipped: true
        };
      }

      await prisma.$transaction(async (tx) => {
        // Update booking
        await tx.booking.update({
          where: { booking_id: bookingId },
          data: {
            status: BookingStatus.Completed,
            actual_check_out: new Date()
          }
        });

        // Update room status
        if (bookingData.room) {
          await tx.room.update({
            where: { room_id: bookingData.room.room_id },
            data: {
              availability_status: RoomStatus.Available,
              last_status_update: new Date()
            }
          });
        }
      });

      console.log(`${isAutomatic ? 'AUTOMATIC' : 'MANUAL'} CHECKOUT: Booking and room updated successfully`);

      // Send notification to pension owner (only for manual checkout to avoid spam)
      if (!isAutomatic && bookingData.room?.pension.owner_id) {
        try {
          await notificationService.createNotification({
            user_id: bookingData.room.pension.owner_id,
            title: 'Booking Completed',
            message: `Booking #${bookingId} has been completed and room is now available`,
            type: 'checkout'
          });
        } catch (notifErr) {
          console.error('Notification failed:', notifErr);
        }
      }

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
        message: error.message || 'Checkout failed'
      };
    }
  }

  /**
   * Get bookings that are overdue for checkout
   * Returns bookings where check_out_date has passed but actual_check_out is not set
   */
  async getOverdueCheckouts() {
    try {
      const overdueBookings = await prisma.booking.findMany({
        where: {
          status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
          check_out_date: { lt: new Date() },
          actual_check_out: null,
          actual_check_in: { not: null }
        },
        include: {
          room: {
            include: {
              pension: { select: { pension_id: true, name: true } }
            }
          }
        },
        orderBy: { check_out_date: 'asc' }
      });

      const formattedBookings = overdueBookings.map(b => ({
        booking_id: b.booking_id,
        status: b.status,
        check_out_date: b.check_out_date,
        actual_check_out: b.actual_check_out,
        room_id: b.room_id,
        availability_status: b.room?.availability_status,
        pension_id: b.room?.pension_id,
        pension_name: b.room?.pension.name
      }));

      return {
        success: true,
        data: formattedBookings,
        count: formattedBookings.length
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
