import prisma from '../lib/prisma';
import { BookingPolicy, BlackoutDate, Pension, Room } from '@prisma/client';

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
}

class BookingValidationService {
  /**
   * Validates a booking against the active BookingPolicy and BlackoutDates for a pension.
   */
  async validateBooking(
    pensionId: number,
    roomId: number | null,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<BookingValidationResult> {
    const errors: string[] = [];
    const now = new Date();

    // Reset times to compare dates easily
    const checkInDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
    const checkOutDay = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const nights = Math.ceil((checkOutDay.getTime() - checkInDay.getTime()) / (1000 * 60 * 60 * 24));

    try {
      // 1. Check Blackout Dates
      const blackoutDates = await prisma.blackoutDate.findMany({
        where: {
          pension_id: pensionId,
          OR: [
            { room_id: null },
            roomId ? { room_id: roomId } : { room_id: -1 }
          ],
          // Overlap check
          start_date: { lte: checkOutDate },
          end_date: { gte: checkInDate }
        }
      });

      if (blackoutDates.length > 0) {
        errors.push(`The selected dates intersect with a restricted period: ${blackoutDates[0].reason || 'Unavailable'}`);
        return { isValid: false, errors };
      }

      // 2. Load Booking Policy
      const policy = await prisma.bookingPolicy.findUnique({
        where: { pension_id: pensionId }
      });

      if (!policy || !policy.is_active) {
        // No active policy, so it's valid (default behavior)
        return { isValid: true, errors: [] };
      }



      // --- Booking Window Limitations ---
      if (policy.booking_window_start && checkInDay < policy.booking_window_start) {
        errors.push(`Bookings are not accepted before ${policy.booking_window_start.toLocaleDateString()}.`);
      }
      if (policy.booking_window_end && checkOutDay > policy.booking_window_end) {
        errors.push(`Bookings are not accepted after ${policy.booking_window_end.toLocaleDateString()}.`);
      }

      // --- Advance Booking Constraints ---
      const diffMs = checkInDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

      if (policy.max_advance_days && diffDays > policy.max_advance_days) {
        errors.push(`You can only book up to ${policy.max_advance_days} days in advance.`);
      }

      if (policy.min_advance_hours && diffHours < policy.min_advance_hours) {
        errors.push(`Bookings must be made at least ${policy.min_advance_hours} hours in advance.`);
      }

      // --- Same Day Constraints ---
      const isSameDay = checkInDay.getTime() === today.getTime();
      if (isSameDay) {
        if (!policy.allow_same_day) {
          errors.push('Same-day bookings are not allowed.');
        } else if (policy.same_day_cutoff) {
          // e.g. "18:00"
          const [cutoffHour, cutoffMinute] = policy.same_day_cutoff.split(':').map(Number);
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();

          if (currentHour > cutoffHour || (currentHour === cutoffHour && currentMinute > cutoffMinute)) {
            errors.push(`Same-day bookings cut off at ${policy.same_day_cutoff}.`);
          }
        }
      }

      // --- Duration Constraints ---
      if (policy.min_stay_nights && nights < policy.min_stay_nights) {
        errors.push(`A minimum stay of ${policy.min_stay_nights} nights is required.`);
      }
      if (policy.max_stay_nights && nights > policy.max_stay_nights) {
        errors.push(`A maximum stay of ${policy.max_stay_nights} nights is allowed.`);
      }

    } catch (error) {
      console.error('Error in BookingValidationService:', error);
      errors.push('Failed to validate booking policies due to an internal error.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new BookingValidationService();
