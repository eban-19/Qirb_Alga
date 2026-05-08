import prisma from '../lib/prisma';
import notificationService from './notificationService';
import { RoomStatus, BookingStatus, Prisma } from '@prisma/client';

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
  newStatus: RoomStatus;
  reason?: string;
  staffId: number;
  bookingId?: number;
}

class AvailabilityService {
  // Check-in guest
  async checkInGuest(data: CheckInData) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { booking_id: data.bookingId },
        include: {
          room: {
            select: {
              room_id: true,
              availability_status: true,
              pension_id: true,
              room_type: true
            }
          }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Validate booking status
      if (booking.status !== BookingStatus.Confirmed) {
        throw new Error('Booking must be confirmed before check-in');
      }

      // Check if already checked in
      if (booking.actual_check_in) {
        throw new Error('Guest already checked in');
      }

      const now = data.actualCheckIn ? new Date(data.actualCheckIn) : new Date();
      const isEarly = data.earlyCheckIn ?? (booking.check_in_date ? now < booking.check_in_date : false);

      await prisma.$transaction(async (tx) => {
        // Update booking
        await tx.booking.update({
          where: { booking_id: data.bookingId },
          data: {
            actual_check_in: now,
            status: BookingStatus.Confirmed
          }
        });

        // Update room status
        if (booking.room && booking.room.availability_status !== RoomStatus.Occupied) {
          await tx.room.update({
            where: { room_id: booking.room.room_id },
            data: {
              availability_status: RoomStatus.Occupied,
              last_status_update: new Date()
            }
          });

          // Log availability change
          await tx.roomAvailabilityLog.create({
            data: {
              room_id: booking.room.room_id,
              old_status: booking.room.availability_status,
              new_status: RoomStatus.Occupied,
              changed_by: data.staffId,
              changed_at: new Date()
            }
          });
        }
      });

      // Send notification to pension owner
      if (booking.room) {
        const ownerId = await this.getPensionOwnerId(booking.room.pension_id);
        await notificationService.createNotification({
          user_id: ownerId,
          title: 'Guest Checked In',
          message: `Guest has checked in to ${booking.room.room_type}${isEarly ? ' (early check-in)' : ''}`,
          type: 'checkin'
        });
      }

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
      const booking = await prisma.booking.findUnique({
        where: { booking_id: data.bookingId },
        include: {
          room: {
            select: {
              room_id: true,
              availability_status: true,
              pension_id: true,
              room_type: true
            }
          }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== BookingStatus.Confirmed && booking.status !== BookingStatus.Completed) {
        throw new Error('Invalid booking status for check-out');
      }

      if (booking.actual_check_out) {
        throw new Error('Guest already checked out');
      }

      const now = data.actualCheckOut ? new Date(data.actualCheckOut) : new Date();
      const isEarly = data.earlyCheckOut ?? (booking.check_out_date ? now < booking.check_out_date : false);

      await prisma.$transaction(async (tx) => {
        // Update booking
        await tx.booking.update({
          where: { booking_id: data.bookingId },
          data: {
            actual_check_out: now,
            status: BookingStatus.Completed
          }
        });

        // Update room status
        if (booking.room && booking.room.availability_status !== RoomStatus.Available) {
          await tx.room.update({
            where: { room_id: booking.room.room_id },
            data: {
              availability_status: RoomStatus.Available,
              last_status_update: new Date()
            }
          });

          // Log availability change
          await tx.roomAvailabilityLog.create({
            data: {
              room_id: booking.room.room_id,
              old_status: booking.room.availability_status,
              new_status: RoomStatus.Available,
              changed_by: data.staffId,
              changed_at: new Date()
            }
          });
        }
      });

      if (booking.room) {
        const ownerId = await this.getPensionOwnerId(booking.room.pension_id);
        await notificationService.createNotification({
          user_id: ownerId,
          title: 'Guest Checked Out',
          message: `Guest has checked out from ${booking.room.room_type}${isEarly ? ' (early check-out)' : ''}`,
          type: 'checkout'
        });
      }

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
      const room = await prisma.room.findUnique({
        where: { room_id: data.roomId },
        select: { room_id: true, availability_status: true }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      const oldStatus = room.availability_status;

      await prisma.$transaction(async (tx) => {
        await tx.room.update({
          where: { room_id: data.roomId },
          data: {
            availability_status: data.newStatus,
            last_status_update: new Date()
          }
        });

        await tx.roomAvailabilityLog.create({
          data: {
            room_id: data.roomId,
            old_status: oldStatus,
            new_status: data.newStatus,
            changed_by: data.staffId,
            changed_at: new Date()
          }
        });
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
      const history = await prisma.roomAvailabilityLog.findMany({
        where: { room_id: roomId },
        include: {
          changer: {
            select: { full_name: true }
          }
        },
        orderBy: { changed_at: 'desc' },
        take: limit
      });

      return {
        success: true,
        data: history.map(h => ({
          ...h,
          changed_by_name: h.changer?.full_name
        }))
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
      const rooms = await prisma.room.findMany({
        where: { pension_id: pensionId },
        include: {
          bookings: {
            where: {
              status: { in: [BookingStatus.Confirmed, BookingStatus.Completed] },
              actual_check_in: null
            },
            include: {
              customer: { select: { full_name: true } }
            },
            orderBy: { check_in_date: 'asc' }
          }
        }
      });

      // Process and sort for "attention" logic
      const processed = rooms.map(r => {
        const primaryBooking = r.bookings[0];
        return {
          room_id: r.room_id,
          room_type: r.room_type,
          availability_status: r.availability_status,
          pension_id: r.pension_id,
          booking_id: primaryBooking?.booking_id,
          customer_id: primaryBooking?.customer_id,
          check_in_date: primaryBooking?.check_in_date,
          check_out_date: primaryBooking?.check_out_date,
          actual_check_in: primaryBooking?.actual_check_in,
          actual_check_out: primaryBooking?.actual_check_out,
          customer_name: primaryBooking?.customer?.full_name
        };
      });

      return {
        success: true,
        data: processed.sort((a: any, b: any) => {
          const aPriority = a.check_in_date && a.check_in_date <= new Date() ? 1 : 2;
          const bPriority = b.check_in_date && b.check_in_date <= new Date() ? 1 : 2;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return (a.check_in_date?.getTime() || 0) - (b.check_in_date?.getTime() || 0);
        })
      };

    } catch (error: any) {
      console.error('Get rooms needing attention error:', error);
      throw error;
    }
  }

  // Helper methods
  private async getPensionOwnerId(pensionId: number): Promise<number> {
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pensionId },
      select: { owner_id: true }
    });
    
    return pension?.owner_id || 0;
  }
}

export default new AvailabilityService();
