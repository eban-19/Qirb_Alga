import * as express from 'express';
import prisma from '../lib/prisma';
import { BookingStatus, BookingSource, RoomStatus, UserStatus, Role, Prisma } from '@prisma/client';

const router = express.Router();

// Create a new public booking
router.post('/bookings', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      pensionId, packageName, checkIn, checkOut, 
      fullName, phone, email, specialRequests, totalPrice, rooms: quantity 
    } = req.body;

    if (!pensionId || !packageName || !checkIn || !checkOut || !fullName || !phone || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    if (checkInDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Check-in date must be in the future' });
    }

    const pId = parseInt(pensionId);

    // Check if pension exists and is approved (using status active in this context based on previous refactor)
    const pension = await prisma.pension.findFirst({
      where: { 
        pension_id: pId,
        status: 'active'
      }
    });

    if (!pension) {
      return res.status(404).json({ success: false, message: 'Pension not found or not approved' });
    }

    // Check package exists for this pension
    const pkg = await prisma.package.findFirst({
      where: { 
        pension_id: pId,
        name: packageName
      }
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found for this pension' });
    }

    // Check room availability
    const bookedCount = await prisma.booking.count({
      where: {
        room: { pension_id: pId },
        status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
        OR: [
          { check_in_date: { lte: checkInDate }, check_out_date: { gte: checkInDate } },
          { check_in_date: { lte: checkOutDate }, check_out_date: { gte: checkOutDate } },
          { check_in_date: { gte: checkInDate }, check_out_date: { lte: checkOutDate } }
        ]
      }
    });

    const totalRooms = await prisma.room.count({
      where: { 
        pension_id: pId,
        availability_status: RoomStatus.Available
      }
    });

    if (bookedCount + parseInt(quantity) > totalRooms) {
      return res.status(400).json({
        success: false,
        message: 'Not enough rooms available for the selected dates',
        available: totalRooms - bookedCount,
        requested: quantity
      });
    }

    // Create or get user
    let userId: number | null = null;
    if (email) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          full_name: fullName,
          phone,
          role: Role.Customer,
          status: UserStatus.Approved,
          password_hash: 'SOCIAL_OR_GUEST_AUTH' // Placeholder
        }
      });
      userId = user.user_id;
    }

    // Find available room
    const availableRoom = await prisma.room.findFirst({
      where: {
        pension_id: pId,
        availability_status: RoomStatus.Available,
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            OR: [
              { check_in_date: { lte: checkInDate }, check_out_date: { gte: checkInDate } },
              { check_in_date: { lte: checkOutDate }, check_out_date: { gte: checkOutDate } },
              { check_in_date: { gte: checkInDate }, check_out_date: { lte: checkOutDate } }
            ]
          }
        }
      }
    });

    if (!availableRoom) {
      return res.status(400).json({ success: false, message: 'No available rooms found for the selected dates' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const finalTotal = totalPrice ? new Prisma.Decimal(totalPrice) : pkg.price.mul(nights).mul(quantity);

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        customer_id: userId,
        room_id: availableRoom.room_id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: finalTotal,
        notes: specialRequests,
        status: BookingStatus.Pending,
        booking_source: BookingSource.App
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: newBooking.booking_id,
        pensionName: pension.name,
        packageName,
        checkIn,
        checkOut,
        totalPrice: finalTotal,
        status: BookingStatus.Pending,
        customerInfo: { fullName, phone, email }
      }
    });

  } catch (error: any) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get available rooms for a pension and dates
router.get('/availability', async (req: express.Request, res: express.Response) => {
  try {
    const { pensionId, checkIn, checkOut } = req.query;

    if (!pensionId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const pId = parseInt(pensionId as string);
    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const availableRooms = await prisma.room.findMany({
      where: {
        pension_id: pId,
        availability_status: RoomStatus.Available,
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            OR: [
              { check_in_date: { lte: checkInDate }, check_out_date: { gte: checkInDate } },
              { check_in_date: { lte: checkOutDate }, check_out_date: { gte: checkOutDate } },
              { check_in_date: { gte: checkInDate }, check_out_date: { lte: checkOutDate } }
            ]
          }
        }
      },
      orderBy: { room_number: 'asc' }
    });

    res.json({
      success: true,
      data: {
        availableRooms,
        totalAvailable: availableRooms.length
      }
    });

  } catch (error: any) {
    console.error('❌ Availability check error:', error);
    res.status(500).json({ success: false, message: 'Failed to check availability' });
  }
});

// Get booking status
router.get('/bookings/:bookingId', async (req: express.Request, res: express.Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId as string);

    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: {
        room: { include: { pension: true } },
        customer: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const formattedBooking = {
      ...booking,
      pension_name: booking.room?.pension.name,
      pension_address: booking.room?.pension.address,
      room_type: booking.room?.room_type,
      room_number: booking.room?.room_number,
      price_per_night: booking.room?.price_per_night,
      customer_name: booking.customer?.full_name || booking.walk_in_guest_name,
      customer_email: booking.customer?.email || booking.walk_in_guest_email,
      customer_phone: booking.customer?.phone || booking.walk_in_guest_phone
    };

    res.json({
      success: true,
      data: formattedBooking
    });

  } catch (error: any) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to get booking' });
  }
});

// Walk-In Booking Endpoint
router.post('/walk-in-bookings', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      pensionId, packageName, guestName, phoneNumber, checkIn, checkOut 
    } = req.body;

    if (!pensionId || !packageName || !guestName || !phoneNumber || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const pId = parseInt(pensionId);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }

    const pension = await prisma.pension.findUnique({
      where: { 
        pension_id: pId,
        status: 'active'
      }
    });

    if (!pension) {
      return res.status(404).json({ success: false, message: 'Pension not found or not approved' });
    }

    const pkg = await prisma.package.findFirst({
      where: { 
        pension_id: pId,
        name: packageName
      }
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found for this pension' });
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = pkg.price.mul(nights);

    const availableRoom = await prisma.room.findFirst({
      where: {
        pension_id: pId,
        availability_status: RoomStatus.Available,
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            OR: [
              { check_in_date: { lte: checkInDate }, check_out_date: { gte: checkInDate } },
              { check_in_date: { lte: checkOutDate }, check_out_date: { gte: checkOutDate } },
              { check_in_date: { gte: checkInDate }, check_out_date: { lte: checkOutDate } }
            ]
          }
        }
      }
    });

    if (!availableRoom) {
      return res.status(400).json({ success: false, message: 'No available rooms for the selected dates' });
    }

    const isToday = checkInDate.toDateString() === new Date().toDateString();

    const newBooking = await prisma.booking.create({
      data: {
        room_id: availableRoom.room_id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: totalPrice,
        status: BookingStatus.Confirmed,
        booking_source: BookingSource.Walk_In,
        walk_in_guest_name: guestName,
        walk_in_guest_phone: phoneNumber,
        is_walk_in: true,
        actual_check_in: isToday ? new Date() : null
      }
    });

    // If checking in today, update room status to occupied
    if (isToday) {
      await prisma.room.update({
        where: { room_id: availableRoom.room_id },
        data: { 
          availability_status: RoomStatus.Occupied,
          last_status_update: new Date()
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Walk-in booking created successfully',
      data: {
        bookingId: newBooking.booking_id,
        pensionName: pension.name,
        packageName,
        checkIn,
        checkOut,
        totalPrice,
        status: BookingStatus.Confirmed,
        guestInfo: { guestName, phoneNumber },
        bookingSource: 'Walk-In'
      }
    });

  } catch (error: any) {
    console.error('❌ Walk-in booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create walk-in booking' });
  }
});

export default router;
