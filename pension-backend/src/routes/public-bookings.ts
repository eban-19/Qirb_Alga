import * as express from 'express';
import prisma from '../lib/prisma';
import { BookingStatus, BookingSource, RoomStatus, UserStatus, Role, Prisma } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import pricingService from '../services/pricingService';
import bookingValidationService from '../services/bookingValidationService';
import { OTPService } from '../services/otp.service';

const router = express.Router();

// Public: Calculate dynamic price based on active policies
router.post('/calculate-price', async (req: express.Request, res: express.Response) => {
  try {
    const { pension_id, room_id, package_id, check_in, check_out, base_price } = req.body;

    if (!pension_id || !check_in || !check_out || !base_price) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const result = await pricingService.calculateBookingPrice(
      parseInt(pension_id),
      room_id ? parseInt(room_id) : null,
      package_id ? parseInt(package_id) : null,
      checkInDate,
      checkOutDate,
      parseFloat(base_price)
    );

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error in public pricing calculation:', error);
    res.status(500).json({ success: false, message: 'Server error during calculation' });
  }
});

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

    // Validate Booking Policies and Blackout Dates
    const validationResult = await bookingValidationService.validateBooking(
      pId,
      null, // room not yet assigned
      new Date(checkIn),
      new Date(checkOut)
    );

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.errors[0] || 'Booking violates property policies',
        errors: validationResult.errors
      });
    }

    // Check room availability
    const bookedCount = await prisma.booking.count({
      where: {
        room: { pension_id: pId },
        status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
        check_in_date: { lt: checkOutDate },
        check_out_date: { gt: checkInDate }
      }
    });

    const totalRooms = await prisma.room.count({
      where: {
        pension_id: pId,
        availability_status: { notIn: [RoomStatus.Maintenance, RoomStatus.Blocked] }
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

    // 1. Check for token in headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.userId;
      } catch (e) {
        // Token invalid, fall back to lookup
      }
    }

    // 2. If no valid token, lookup/upsert by email or phone
    if (!userId) {
      if (email || phone) {
        const normalizedPhone = phone ? OTPService.normalizePhone(phone) : undefined;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              email ? { email } : undefined,
              normalizedPhone ? { phone: normalizedPhone } : undefined,
              phone ? { phone } : undefined
            ].filter(Boolean) as any
          }
        });

        if (user) {
          userId = user.user_id;
        } else {
          // Create new guest/customer user
          const newUser = await prisma.user.create({
            data: {
              email: email || undefined,
              full_name: fullName,
              phone: normalizedPhone || phone,
              role: Role.Customer,
              status: UserStatus.Approved,
              approved: 1,
              password_hash: 'GUEST_USER'
            }
          });
          userId = newUser.user_id;
        }
      }
    }

    // Find available room
    const availableRoom = await prisma.room.findFirst({
      where: {
        pension_id: pId,
        availability_status: { notIn: [RoomStatus.Maintenance, RoomStatus.Blocked] },
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            check_in_date: { lt: checkOutDate },
            check_out_date: { gt: checkInDate }
          }
        }
      }
    });

    if (!availableRoom) {
      return res.status(400).json({ success: false, message: 'No available rooms found for the selected dates' });
    }

    // Calculate total price using dynamic pricing engine
    const pricingResult = await pricingService.calculateBookingPrice(
      pId,
      availableRoom.room_id,
      pkg.package_id,
      checkInDate,
      checkOutDate,
      Number(pkg.price)
    );

    const finalTotal = totalPrice ? new Prisma.Decimal(totalPrice) : new Prisma.Decimal(pricingResult.finalTotal * parseInt(quantity));

    // Load booking policy to check instant_booking
    const policy = await prisma.bookingPolicy.findUnique({ where: { pension_id: pId } });
    const isInstant = policy ? policy.instant_booking : true;

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        customer_id: userId,
        room_id: availableRoom.room_id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: finalTotal,
        notes: specialRequests,
        status: isInstant ? BookingStatus.Confirmed : BookingStatus.Pending,
        booking_source: BookingSource.App
      }
    });

    res.status(201).json({
      success: true,
      message: isInstant ? 'Booking created successfully' : 'Booking request sent for approval',
      data: {
        bookingId: newBooking.booking_id,
        pensionName: pension.name,
        packageName,
        checkIn,
        checkOut,
        totalPrice: finalTotal,
        status: BookingStatus.Pending,
        customerInfo: { fullName, phone, email },
        requiresApproval: !isInstant
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

    // Fetch blackout dates that overlap
    const blackoutDates = await prisma.blackoutDate.findMany({
      where: {
        pension_id: pId,
        start_date: { lte: checkOutDate },
        end_date: { gte: checkInDate }
      }
    });

    const isWholePensionBlackedOut = blackoutDates.some(b => b.room_id === null);

    if (isWholePensionBlackedOut) {
      return res.json({
        success: true,
        data: { availableRooms: [], totalAvailable: 0 }
      });
    }

    const blackedOutRoomIds = blackoutDates.filter(b => b.room_id !== null).map(b => b.room_id);

    const availableRooms = await prisma.room.findMany({
      where: {
        pension_id: pId,
        availability_status: { notIn: [RoomStatus.Maintenance, RoomStatus.Blocked] },
        ...(blackedOutRoomIds.length > 0 ? { room_id: { notIn: blackedOutRoomIds as number[] } } : {}),
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            check_in_date: { lt: checkOutDate },
            check_out_date: { gt: checkInDate }
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
      pensionId, packageName, packageId, guestName, phoneNumber, checkIn, checkOut
    } = req.body;

    if (!pensionId || (!packageName && !packageId) || !guestName || !phoneNumber || !checkIn || !checkOut) {
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
        OR: [
          ...(packageName ? [{ name: packageName }] : []),
          ...(packageId ? [{ package_id: parseInt(packageId) }] : [])
        ]
      }
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found for this pension' });
    }

    const pricingResult = await pricingService.calculateBookingPrice(
      pId,
      null, // Don't know room yet
      pkg.package_id,
      checkInDate,
      checkOutDate,
      Number(pkg.price)
    );
    const totalPrice = new Prisma.Decimal(pricingResult.finalTotal);

    let availableRoom = await prisma.room.findFirst({
      where: {
        pension_id: pId,
        NOT: {
          availability_status: { in: [RoomStatus.Maintenance, RoomStatus.Blocked] }
        },
        OR: [
          { package_id: pkg.package_id },
          { package_id: null }
        ],
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            check_in_date: { lt: checkOutDate },
            check_out_date: { gt: checkInDate }
          }
        }
      }
    });

    if (!availableRoom) {
      // Fallback: search any room in the pension not blocked for these dates
      availableRoom = await prisma.room.findFirst({
        where: {
          pension_id: pId,
          NOT: {
            availability_status: { in: [RoomStatus.Maintenance, RoomStatus.Blocked] }
          },
          bookings: {
            none: {
              status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
              check_in_date: { lt: checkOutDate },
              check_out_date: { gt: checkInDate }
            }
          }
        }
      });
    }

    if (!availableRoom) {
      return res.status(400).json({ success: false, message: 'No available rooms for the selected dates' });
    }

    const isToday = checkInDate.toDateString() === new Date().toDateString();

    // 1. Normalize phone and find or create User account for walk-in guest
    const normalizedPhone = OTPService.normalizePhone(phoneNumber);
    let customerUser = await prisma.user.findFirst({
      where: {
        role: Role.Customer, // Ensure we match Customer role, not Owner/Admin
        OR: [
          { phone: normalizedPhone },
          { phone: phoneNumber }
        ]
      }
    });

    if (!customerUser) {
      customerUser = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          full_name: guestName,
          role: Role.Customer,
          status: UserStatus.Approved,
          approved: 1,
          password_hash: 'GUEST_USER'
        }
      });
    } else if (guestName && (!customerUser.full_name || customerUser.full_name === 'Guest Customer')) {
      customerUser = await prisma.user.update({
        where: { user_id: customerUser.user_id },
        data: { full_name: guestName }
      });
    }

    const newBooking = await prisma.booking.create({
      data: {
        customer_id: customerUser.user_id,
        room_id: availableRoom.room_id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: totalPrice,
        status: BookingStatus.Confirmed,
        booking_source: BookingSource.Walk_In,
        walk_in_guest_name: guestName,
        walk_in_guest_phone: normalizedPhone,
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
