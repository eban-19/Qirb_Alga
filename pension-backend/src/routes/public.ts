import * as express from 'express';
import prisma from '../lib/prisma';
import upload from '../middleware/upload';
import notificationService from '../services/notificationService';
import geocodingService from '../services/geocoding';
import { PensionStatus, ApprovalStatus, RoomStatus, BookingStatus, Role, BookingSource, Prisma } from '@prisma/client';

const router = express.Router();

interface Package {
  id: number | string;
  name: string;
  price: number;
  description: string;
  image?: string | null;
  services: any[];
  availableRooms: number;
  isMostPopular: boolean;
  package_id?: number;
  availableRoomsCount?: number;
  image_url?: string | null;
  is_most_popular?: number | boolean;
  images?: string[];
}

interface Pension {
  id: string;
  name: string;
  description: string;
  ownerInfo: string;
  roomDetails: string;
  locationName: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  availableRooms: number;
  images: string[];
  phone: string;
  email: string;
  packages: Package[];
}

// Debug middleware to log all requests to public routes
router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`Public route: ${req.method} ${req.path}`);
  next();
});

// Get all public pensions
router.get('/pensions', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const where: any = {
      status: PensionStatus.active,
      owner: {
        ownerProfile: {
          approval_status: ApprovalStatus.Approved
        }
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { address: { contains: search as string } }
      ];
    }

    const pensionsResult = await prisma.pension.findMany({
      where,
      include: {
        owner: {
          include: {
            ownerProfile: true
          }
        },
        packages: {
          include: {
            rooms: {
              where: {
                availability_status: RoomStatus.Available
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Map each pension to include its real packages and counts
    const items = await Promise.all(pensionsResult.map(async (p: any) => {
      const pensionId = p.pension_id;
      
      const packages = p.packages.map((pkg: any) => ({
        ...pkg,
        availableRoomsCount: pkg.rooms.length
      }));

      const liveAvailableRooms = packages.reduce((sum: number, pkg: any) => sum + pkg.availableRoomsCount, 0);

      // Only include pension if it has available rooms
      if (liveAvailableRooms === 0) {
        return null;
      }

      // Get coordinates (use existing or geocode from address)
      let coordinates = { 
        lat: parseFloat(p.latitude?.toString()) || null, 
        lng: parseFloat(p.longitude?.toString()) || null 
      };
      
      if (!coordinates.lat || !coordinates.lng || isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
        try {
          coordinates = await geocodingService.geocodeAddress(p.address || '');
        } catch (error: any) {
          coordinates = { lat: 9.03, lng: 38.74 }; // Default fallback
        }
      }

      return {
        id: pensionId.toString(),
        name: p.name,
        description: p.description,
        ownerInfo: p.owner_info || `Managed by property owner`,
        roomDetails: p.room_details || `${p.capacity || 0} rooms total`,
        locationName: p.address,
        city: p.address ? p.address.split(',')[0] : 'Addis Ababa',
        area: p.address ? p.address.split(',')[0] : 'Addis Ababa',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        availableRooms: liveAvailableRooms,
        images: [p.image_url || '/src/assets/room-1.png'],
        image_url: p.image_url,
        phone: p.phone || '',
        email: p.email || '',
        packages: packages
          .filter((pkg: any) => pkg.availableRoomsCount > 0)
          .map((pkg: any): Package => ({
            id: pkg.package_id,
            name: pkg.name,
            price: parseFloat(pkg.price.toString()),
            description: pkg.description,
            image: pkg.image_url || null,
            services: (() => {
              if (Array.isArray(pkg.inclusions)) return pkg.inclusions;
              if (typeof pkg.inclusions === 'string') {
                try {
                  return JSON.parse(pkg.inclusions);
                } catch (e) {
                  return pkg.inclusions.split(',').map((s: string) => s.trim()).filter(Boolean);
                }
              }
              return [];
            })(),
            availableRooms: pkg.availableRoomsCount || 0,
            isMostPopular: pkg.is_most_popular === 1 || pkg.is_most_popular === true,
            images: Array.isArray(pkg.images) ? pkg.images : []
          }))
      };
    }));

    // Filter out pensions with no available rooms
    const availableItems = items.filter(item => item !== null);

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedItems = availableItems.slice(startIndex, startIndex + parseInt(limit as string));

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: availableItems.length,
          totalPages: Math.ceil(availableItems.length / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    console.error('Get public pensions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single public pension
router.get('/pensions/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const pId = parseInt(id as string);

    const p = await prisma.pension.findUnique({
      where: {
        pension_id: pId,
        status: PensionStatus.active,
        owner: {
          ownerProfile: {
            approval_status: ApprovalStatus.Approved
          }
        }
      },
      include: {
        packages: {
          include: {
            rooms: {
              where: {
                availability_status: RoomStatus.Available
              }
            }
          }
        }
      }
    });

    if (!p) {
      return res.status(404).json({ success: false, message: 'Pension not found' });
    }

    const packages = p.packages.map((pkg: any) => ({
      ...pkg,
      availableRoomsCount: pkg.rooms.length
    }));

    const liveAvailableRooms = packages.reduce((sum: number, pkg: any) => sum + pkg.availableRoomsCount, 0);

    if (liveAvailableRooms === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pension not available - no rooms currently available' 
      });
    }

    // Get coordinates (use existing or geocode from address)
    let coordinates = { 
      lat: p.latitude ? parseFloat(p.latitude.toString()) : null, 
      lng: p.longitude ? parseFloat(p.longitude.toString()) : null 
    };
    
    if (!coordinates.lat || !coordinates.lng || isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      try {
        coordinates = await geocodingService.geocodeAddress(p.address || '');
      } catch (error: any) {
        coordinates = { lat: 9.03, lng: 38.74 }; // Default fallback
      }
    }

    const mappedPension: Pension = {
      id: p.pension_id.toString(),
      name: p.name,
      description: p.description || '',
      ownerInfo: p.owner_info || 'Professional hospitality service',
      roomDetails: p.room_details || `${p.capacity || 0} rooms available`,
      locationName: p.address || '',
      city: p.address || '',
      area: p.address ? p.address.split(',')[0] : 'Addis Ababa',
      latitude: coordinates.lat || 0,
      longitude: coordinates.lng || 0,
      availableRooms: liveAvailableRooms,
      images: [p.image_url || '/src/assets/room-1.png'],
      phone: p.phone || '',
      email: p.email || '',
      packages: packages
        .filter((pkg: any) => pkg.availableRoomsCount > 0)
        .map((pkg: any): Package => ({
          id: pkg.package_id,
          name: pkg.name,
          price: parseFloat(pkg.price.toString()),
          description: pkg.description,
          image: pkg.image_url || null,
          services: (() => {
            if (Array.isArray(pkg.inclusions)) return pkg.inclusions;
            if (typeof pkg.inclusions === 'string') {
              try {
                return JSON.parse(pkg.inclusions);
              } catch (e) {
                return pkg.inclusions.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
            }
            return [];
          })(),
          availableRooms: pkg.availableRoomsCount || 0,
          isMostPopular: pkg.is_most_popular === 1 || pkg.is_most_popular === true,
          images: Array.isArray(pkg.images) ? pkg.images : []
        }))
    };

    res.json({
      success: true,
      data: mappedPension
    });
  } catch (error: any) {
    console.error('Get public pension error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test endpoint for debugging
router.get('/test', (req: express.Request, res: express.Response) => {
  res.json({ success: true, message: 'Public routes working' });
});

// Create a new public booking
router.post('/bookings', upload.single('idDocument'), async (req: any, res: express.Response) => {
  try {
    const pensionId = parseInt(req.body.pensionId as string);
    const packageName = req.body.packageName;
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const fullName = req.body.fullName;
    const phone = req.body.phone;
    const email = req.body.email;
    const totalPrice = parseFloat(req.body.totalPrice);
    const quantity = parseInt(req.body.rooms as string) || 1;

    const idDocumentUrl = req.file ? '/uploads/' + req.file.filename : null;

    if (!pensionId || !packageName || !checkIn || !checkOut || !fullName || !phone || !idDocumentUrl) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

    // 1. Find or Create Customer
    let user = await prisma.user.findFirst({
      where: { phone }
    });

    if (!user) {
      // Generate a fallback email if none provided (email is required in schema)
      const userEmail = email || `${phone.replace(/\s+/g, '').replace(/\+/g, '')}@guest.qirbalga.com`;
      
      user = await prisma.user.create({
        data: {
          full_name: fullName,
          phone,
          email: userEmail,
          role: Role.Customer,
          status: ApprovalStatus.Approved,
          password_hash: ''
        }
      });
    }

    // 2. Find package
    const pkg = await prisma.package.findFirst({
      where: {
        pension_id: pensionId,
        name: packageName
      }
    });

    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Package not found' });
    }

    // 3. Find available rooms with date check
    const availableRooms = await prisma.room.findMany({
      where: {
        pension_id: pensionId,
        package_id: pkg.package_id,
        availability_status: RoomStatus.Available,
        bookings: {
          none: {
            status: { in: [BookingStatus.Confirmed, BookingStatus.Pending] },
            OR: [
              { check_in_date: { lte: checkOut }, check_out_date: { gte: checkIn } }
            ]
          }
        }
      },
      take: quantity
    });

    if (availableRooms.length < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${availableRooms.length} room(s) available for these dates.` 
      });
    }

    const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 4. Create bookings and update room status
    const result = await prisma.$transaction(async (tx) => {
      const bookings = [];
      for (const room of availableRooms) {
        const b = await tx.booking.create({
          data: {
            room_id: room.room_id,
            room_number: room.room_number,
            customer_id: user!.user_id,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_price: new Prisma.Decimal(totalPrice / quantity),
            status: BookingStatus.Pending,
            id_document_url: idDocumentUrl,
            pass_code: passCode,
            booking_source: BookingSource.App
          }
        });
        
        await tx.room.update({
          where: { room_id: room.room_id },
          data: { 
            availability_status: RoomStatus.Occupied,
            last_status_update: new Date()
          }
        });
        bookings.push(b);
      }
      return bookings;
    });

    // Notify owner
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pensionId },
      select: { owner_id: true }
    });

    if (pension) {
      await notificationService.createNotification({
        user_id: pension.owner_id!,
        title: 'New Booking Received',
        message: `${fullName} booked ${quantity} room(s) for ${checkIn.toLocaleDateString()} to ${checkOut.toLocaleDateString()}`,
        type: 'new_booking'
      });
    }

    res.json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: result[0].booking_id,
        bookingIds: result.map(b => b.booking_id),
        customer: { fullName, phone, email: email || '' },
        booking: {
          id: result[0].booking_id,
          status: 'Confirmed',
          checkIn,
          checkOut,
          totalPrice,
          packageName,
          passCode,
          roomNumber: result[0].room_number
        }
      }
    });

  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get booking status
router.get('/bookings/:id/status', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const bId = parseInt(id as string);

    const booking = await prisma.booking.findUnique({
      where: { booking_id: bId },
      include: {
        customer: true,
        room: {
          include: {
            pension: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({
      success: true,
      data: {
        status: booking.status,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: booking.total_price,
        room_type: booking.room?.room_type,
        pension_name: booking.room?.pension?.name,
        package_name: booking.room?.room_type
      }
    });
  } catch (error: any) {
    console.error('Get booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Walk-In Booking Endpoint
router.post('/walk-in-bookings', async (req: express.Request, res: express.Response) => {
  try {
    const { 
      pensionId, packageName, guestName, phoneNumber, checkIn, checkOut 
    } = req.body;
    const pId = parseInt(pensionId as string);

    if (!pensionId || !packageName || !guestName || !phoneNumber || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const pension = await prisma.pension.findUnique({
      where: { pension_id: pId, status: PensionStatus.active }
    });

    if (!pension) {
      return res.status(404).json({ success: false, message: 'Pension not found or not active' });
    }

    const pkg = await prisma.package.findFirst({
      where: { pension_id: pId, name: packageName }
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found for this pension' });
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(pkg.price.toString()) * nights;

    const availableRoom = await prisma.room.findFirst({
      where: {
        pension_id: pId,
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
      return res.status(400).json({ success: false, message: 'No available rooms for the selected dates' });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          room_id: availableRoom.room_id,
          room_number: availableRoom.room_number,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          total_price: new Prisma.Decimal(totalPrice),
          status: BookingStatus.Confirmed,
          walk_in_guest_name: guestName,
          walk_in_guest_phone: phoneNumber,
          booking_source: BookingSource.Walk_In
        }
      });

      await tx.room.update({
        where: { room_id: availableRoom.room_id },
        data: { 
          availability_status: RoomStatus.Occupied,
          last_status_update: new Date()
        }
      });

      return b;
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in booking created successfully',
      data: {
        bookingId: booking.booking_id,
        roomNumber: availableRoom.room_number,
        pensionName: pension.name,
        packageName,
        checkIn,
        checkOut,
        totalPrice,
        status: 'Confirmed',
        guestInfo: { guestName, phoneNumber },
        bookingSource: 'Walk-In'
      }
    });

  } catch (error: any) {
    console.error('Walk-in booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create walk-in booking' });
  }
});

export default router;
