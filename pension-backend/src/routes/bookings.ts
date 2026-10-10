import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import notificationService from '../services/notificationService';
import bookingService from '../services/bookingService';
import { BookingStatus, RoomStatus, Prisma } from '@prisma/client';
import { validateName, validatePhone, validateDateRange } from '../utils/validation';

const router = express.Router();

// Get bookings for user (protected)
router.get('/', authenticateToken as any, async (req: any, res: any, next: any) => {
  try {
    const { page = 1, limit = 10, status, pension_id } = req.query;
    const userId = req.user.userId;
    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const where: Prisma.BookingWhereInput = {
      room: {
        pension: {
          owner_id: userId
        }
      }
    };

    if (status) {
      where.status = status as BookingStatus;
    }

    if (pension_id) {
      where.room = {
        is: {
          pension_id: parseInt(pension_id as string)
        }
      };
    }

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: {
          customer: {
            select: {
              full_name: true,
              email: true,
              phone: true
            }
          },
          room: {
            include: {
              pension: {
                select: {
                  pension_id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take,
        skip
      }),
      prisma.booking.count({ where })
    ]);

    const formattedBookings = bookings.map(b => ({
      ...b,
      user_name: b.customer?.full_name || b.walk_in_guest_name,
      user_email: b.customer?.email || b.walk_in_guest_email,
      user_phone: b.customer?.phone || b.walk_in_guest_phone,
      pension_id: b.room?.pension_id,
      room_type: b.room?.room_type,
      price_per_night: b.room?.price_per_night,
      room_number: b.room?.room_number
    }));

    res.json({
      success: true,
      data: {
        items: formattedBookings,
        total
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
    const bookingId = parseInt(req.params.bookingId);
    const userId = req.user.userId;

    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const bookingData = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: {
        customer: {
          select: {
            full_name: true,
            email: true,
            phone: true
          }
        },
        room: {
          include: {
            pension: {
              select: {
                owner_id: true,
                name: true,
                address: true
              }
            }
          }
        }
      }
    });

    if (!bookingData || bookingData.room?.pension.owner_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const formattedBooking = {
      ...bookingData,
      user_name: bookingData.customer?.full_name,
      user_email: bookingData.customer?.email,
      user_phone: bookingData.customer?.phone,
      pension_id: bookingData.room?.pension_id,
      room_type: bookingData.room?.room_type,
      price_per_night: bookingData.room?.price_per_night,
      room_number: bookingData.room?.room_number,
      pension_name: bookingData.room?.pension.name,
      pension_address: bookingData.room?.pension.address
    };

    res.json({
      success: true,
      data: formattedBooking
    });

  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Check Walk-In Availability
router.post('/walk-in/check-availability', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { packageId, checkIn, checkOut } = req.body;
    const userId = req.user.userId;

    if (!packageId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const pension = await prisma.pension.findFirst({ where: { owner_id: userId } });
    if (!pension) return res.status(404).json({ success: false, message: 'Pension not found' });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const pkg = await prisma.package.findUnique({
      where: { package_id: parseInt(packageId) }
    });

    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    // Rooms are directly linked to a package via package_id
    const availableRoomsCount = await prisma.room.count({
      where: {
        pension_id: pension.pension_id,
        package_id: pkg.package_id,
        availability_status: RoomStatus.Available,
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            OR: [
              { check_in_date: { lte: checkOutDate }, check_out_date: { gte: checkInDate } }
            ]
          }
        }
      }
    });

    res.json({ success: true, availableRooms: availableRoomsCount });
  } catch (error: any) {
    console.error('Error checking walk-in availability:', error);
    res.status(500).json({ success: false, message: 'Failed to check availability', error: error.message });
  }
});

// Create Walk-In Booking
router.post('/walk-in', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { guestName, phoneNumber, packageId, checkIn, checkOut } = req.body;
    const userId = req.user.userId;

    if (!guestName || !phoneNumber || !packageId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const nameErr = validateName(guestName, 'Guest name', true);
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const phoneErr = validatePhone(phoneNumber, true, false, 'Guest phone number');
    if (phoneErr) return res.status(400).json({ success: false, message: phoneErr });

    const dateErr = validateDateRange(checkIn, checkOut, false);
    if (dateErr) return res.status(400).json({ success: false, message: dateErr });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const pension = await prisma.pension.findFirst({
      where: { owner_id: userId }
    });
    if (!pension) {
      return res.status(404).json({ success: false, message: 'Pension not found for this owner' });
    }

    const pkg = await prisma.package.findUnique({
      where: { package_id: parseInt(packageId) }
    });

    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    // Find available room strictly matching the package via package_id
    const availableRoom = await prisma.room.findFirst({
      where: {
        pension_id: pension.pension_id,
        package_id: pkg.package_id,
        availability_status: RoomStatus.Available,
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            OR: [
              { check_in_date: { lte: checkOutDate }, check_out_date: { gte: checkInDate } }
            ]
          }
        }
      }
    });

    if (!availableRoom) {
      return res.status(400).json({ success: false, message: 'No available rooms for the selected package and dates' });
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(pkg.price.toString()) * nights;
    const isToday = checkInDate.toDateString() === new Date().toDateString();

    const booking = await prisma.booking.create({
      data: {
        room_id: availableRoom.room_id,
        room_number: availableRoom.room_number,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: new Prisma.Decimal(totalPrice),
        status: BookingStatus.Confirmed,
        walk_in_guest_name: guestName,
        walk_in_guest_phone: phoneNumber,
        booking_source: 'Walk_In' as any,
        is_walk_in: true,
        actual_check_in: isToday ? new Date() : null
      }
    });

    res.json({ success: true, message: 'Walk-in booking created successfully!', data: booking });
  } catch (error: any) {
    console.error('Error creating walk-in booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create walk-in booking', error: error.message });
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

    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, and check-out date are required'
      });
    }

    const roomId = parseInt(room_id);
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { 
        room_id: roomId,
        availability_status: RoomStatus.Available
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    // Check overlap
    const existingBooking = await prisma.booking.findFirst({
      where: {
        room_id: roomId,
        status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
        OR: [
          { check_in_date: { lte: checkIn }, check_out_date: { gte: checkIn } },
          { check_in_date: { lte: checkOut }, check_out_date: { gte: checkOut } },
          { check_in_date: { gte: checkIn }, check_out_date: { lte: checkOut } }
        ]
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for these dates'
      });
    }

    // Calculate total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const total_price = new Prisma.Decimal(nights * (room.price_per_night as any || 0));

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        customer_id: userId,
        room_id: roomId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_price,
        notes: special_requests,
        status: BookingStatus.Pending
      }
    });

    // Send notification to owner
    const pension = await prisma.pension.findUnique({
      where: { pension_id: room.pension_id },
      select: { owner_id: true }
    });

    if (pension) {
      await notificationService.createNotification({
        user_id: pension.owner_id,
        title: 'New Booking Request',
        message: `A new booking request has been made for ${room.room_type} from ${check_in_date} to ${check_out_date}`,
        type: 'booking'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: newBooking.booking_id,
        room_id: roomId,
        check_in_date,
        check_out_date,
        total_price,
        status: BookingStatus.Pending
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
    const bookingId = parseInt(req.params.bookingId);
    const userId = req.user.userId;
    const { status } = req.body;

    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if booking exists and belongs to user's pension
    const bookingData = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: {
        room: {
          include: { pension: true }
        }
      }
    });

    if (!bookingData || bookingData.room?.pension.owner_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status
    await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { status: status as BookingStatus }
    });

    // Send notification to customer
    if (bookingData.customer_id) {
      // Map booking status to notification type
      let notificationType: any = 'system';
      if (status === 'Confirmed') notificationType = 'booking_confirmed';
      else if (status === 'Cancelled') notificationType = 'booking_cancelled';

      await notificationService.createNotification({
        user_id: bookingData.customer_id,
        title: `Booking ${status}`,
        message: `Your booking has been ${status.toLowerCase()}`,
        type: notificationType
      });
    }

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
    const bookingId = parseInt(req.params.bookingId);
    const userId = req.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId }
    });

    if (!booking || booking.customer_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === BookingStatus.Confirmed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel confirmed booking'
      });
    }

    await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { status: BookingStatus.Cancelled }
    });

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

// Complete booking early (manual checkout by admin/owner)
router.post('/:bookingId/complete-early', authenticateToken as any, async (req: any, res: any) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const userId = req.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: {
        room: {
          include: { pension: true }
        }
      }
    });

    if (!booking || booking.room?.pension.owner_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const result = await bookingService.completeBookingCheckout(bookingId, false);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error: any) {
    console.error("EARLY CHECKOUT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unknown error"
    });
  }
});

export default router;
