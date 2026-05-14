import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireAdmin, requireOwnerApproval, requireSubscription } from '../middleware/auth';
import geocodingService from '../services/geocoding';
import { getMultilingualText } from '../utils/multilingual';
import { Prisma } from '@prisma/client';

const router = express.Router();

interface PensionData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  owner_info: string;
  room_details: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

// Get all pensions (protected) - Simple route for frontend
router.get('/', authenticateToken as any, requireOwnerApproval as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.userId;
    const { language = 'en' } = req.query;
    console.log('=== GET PENSIONS FOR USER ===');
    console.log('User ID:', userId);
    
    const pensions = await prisma.pension.findMany({
      where: { owner_id: userId },
      include: {
        owner: {
          select: {
            ownerProfile: {
              select: {
                business_name: true,
                business_email: true,
                business_phone: true,
                license_number: true,
                approval_status: true
              }
            }
          }
        }
      }
    });

    console.log('Found pensions:', pensions.length);
    
    // Apply multilingual text extraction and format for frontend
    const formattedPensions = pensions.map((p: any) => {
      const profile = p.owner?.ownerProfile;
      return {
        id: p.pension_id,
        name: getMultilingualText(p.name_ml, language as string) || p.name,
        address: p.address,
        description: getMultilingualText(p.description_ml, language as string) || p.description,
        phone: p.phone,
        email: p.email,
        capacity: p.capacity,
        image_url: p.image_url,
        latitude: p.latitude ? Number(p.latitude) : null,
        longitude: p.longitude ? Number(p.longitude) : null,
        owner_id: p.owner_id,
        business_name: profile?.business_name,
        business_email: profile?.business_email,
        business_phone: profile?.business_phone,
        license_number: profile?.license_number,
        approval_status: profile?.approval_status
      };
    });
    
    res.json({
      success: true,
      data: formattedPensions
    });
  } catch (error: any) {
    console.error('Get pensions error:', error);
    next(error);
  }
});

// Get pension by ID (public)
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { language = 'en' } = req.query;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const pensionData = await prisma.pension.findUnique({
      where: { pension_id: id },
      include: {
        owner: {
          select: {
            full_name: true,
            email: true
          }
        },
        _count: {
          select: {
            rooms: {
              where: { availability_status: 'Available' as any } // Cast to any to bypass enum check if needed, or use RoomStatus
            },
            reviews: true
          }
        }
      }
    });

    if (!pensionData) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Get average rating
    const avgRatingResult = await prisma.review.aggregate({
      where: { pension_id: id },
      _avg: { rating: true }
    });

    const pension = { 
      ...pensionData, 
      id: pensionData.pension_id,
      owner_name: pensionData.owner.full_name,
      owner_email: pensionData.owner.email,
      available_rooms: pensionData._count.rooms,
      avg_rating: avgRatingResult._avg.rating || 0,
      review_count: pensionData._count.reviews,
      name: getMultilingualText(pensionData.name_ml as any, language as string) || pensionData.name,
      description: getMultilingualText(pensionData.description_ml as any, language as string) || pensionData.description,
      owner_info: getMultilingualText(pensionData.owner_info_ml as any, language as string) || pensionData.owner_info,
      room_details: getMultilingualText(pensionData.room_details_ml as any, language as string) || pensionData.room_details
    };

    // Get rooms for this pension
    const roomsData = await prisma.room.findMany({
      where: { 
        pension_id: id,
        availability_status: 'Available' as any
      },
      orderBy: { price_per_night: 'asc' }
    });

    const rooms = roomsData.map((r: any) => ({ 
      ...r, 
      id: r.room_id,
      type: getMultilingualText(r.room_type_ml, language as string) || r.room_type
    }));

    // Get packages for this pension
    const packagesData = await prisma.package.findMany({
      where: { 
        pension_id: id,
        is_active: true
      },
      orderBy: { price: 'asc' }
    });

    const packages = packagesData.map((pkg: any) => ({ 
      ...pkg, 
      id: pkg.package_id,
      name: getMultilingualText(pkg.name_ml as any, language as string) || pkg.name,
      description: getMultilingualText(pkg.description_ml as any, language as string) || pkg.description
    }));

    // Get recent reviews
    const reviewsData = await prisma.review.findMany({
      where: { pension_id: id },
      include: {
        customer: {
          select: {
            full_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    const reviews = reviewsData.map((rev: any) => ({ 
      ...rev, 
      id: rev.review_id,
      full_name: rev.customer.full_name,
      email: rev.customer.email
    }));

    res.json({
      success: true,
      data: {
        pension,
        rooms,
        packages,
        reviews
      }
    });

  } catch (error: any) {
    console.error('Get pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// TEMPORARY: Add properties endpoint here to fix the 500 error
router.get('/properties/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const property = await prisma.pension.findUnique({
      where: { pension_id: id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: property.pension_id,
        name: property.name,
        location: property.address,
        description: property.description || 'No description available',
        rooms: [],
        packages: [],
        owner: {
          id: property.owner_id,
          name: 'Property Owner',
          email: 'owner@example.com',
          phone: 'N/A'
        },
        documents: [],
        images: property.image_url ? [property.image_url] : []
      }
    });

  } catch (error: any) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new pension (protected)
router.post('/', authenticateToken as any, requireSubscription as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details,
      image_url,
      latitude,
      longitude,
      name_ml,
      description_ml,
      owner_info_ml,
      room_details_ml
    }: PensionData & { name_ml?: any, description_ml?: any, owner_info_ml?: any, room_details_ml?: any } = req.body;

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name and address are required'
      });
    }

    // Geocode address only if coordinates are missing
    let coordinates = { lat: 9.03, lng: 38.74 }; // Default Addis Ababa coordinates
    if (latitude !== undefined && longitude !== undefined) {
      coordinates = { lat: Number(latitude), lng: Number(longitude) };
    } else if (address) {
      try {
        coordinates = await geocodingService.geocodeAddress(address);
      } catch (err) {
        console.warn('Geocoding failed, using defaults');
      }
    }

    const newPension = await prisma.pension.create({
      data: {
        name,
        description,
        owner_info,
        room_details,
        address,
        phone,
        email,
        capacity: parseInt(capacity as any) || 0,
        latitude: new Prisma.Decimal(coordinates.lat),
        longitude: new Prisma.Decimal(coordinates.lng),
        owner_id: userId,
        status: 'pending' as any,
        image_url: image_url || null,
        name_ml: name_ml || { en: name },
        description_ml: description_ml || { en: description },
        owner_info_ml: owner_info_ml || { en: owner_info },
        room_details_ml: room_details_ml || { en: room_details }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pension created successfully',
      data: newPension
    });

  } catch (error: any) {
    console.error('Create pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update pension (protected)
router.put('/:id', authenticateToken as any, requireSubscription as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details,
      image_url,
      latitude,
      longitude,
      name_ml,
      description_ml,
      owner_info_ml,
      room_details_ml
    }: PensionData & { name_ml?: any, description_ml?: any, owner_info_ml?: any, room_details_ml?: any } = req.body;

    // Check if user owns this pension or is admin
    const pension = await prisma.pension.findUnique({
      where: { pension_id: id }
    });

    if (!pension) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    if (pension.owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own pensions'
      });
    }

    // Geocode address if changed AND no explicit coordinates provided
    let coordinates = { lat: Number(pension.latitude), lng: Number(pension.longitude) };
    if (latitude !== undefined && longitude !== undefined) {
      coordinates = { lat: Number(latitude), lng: Number(longitude) };
    } else if (address && address !== pension.address) {
      try {
        coordinates = await geocodingService.geocodeAddress(address);
      } catch (err) {
        console.warn('Geocoding failed, keeping old coords');
      }
    }
    
    const updatedPension = await prisma.pension.update({
      where: { pension_id: id },
      data: {
        name: name || undefined,
        description: description || undefined,
        owner_info: owner_info || undefined,
        room_details: room_details || undefined,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
        capacity: capacity !== undefined ? parseInt(capacity as any) : undefined,
        latitude: new Prisma.Decimal(coordinates.lat),
        longitude: new Prisma.Decimal(coordinates.lng),
        image_url: image_url || undefined,
        name_ml: name_ml || undefined,
        description_ml: description_ml || undefined,
        owner_info_ml: owner_info_ml || undefined,
        room_details_ml: room_details_ml || undefined
      }
    });

    res.json({
      success: true,
      message: 'Pension updated successfully',
      data: { pension: updatedPension }
    });

  } catch (error: any) {
    console.error('Update pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete pension (protected - admin only)
router.delete('/:id', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    // Check if there are active bookings
    const activeBookingsCount = await prisma.booking.count({
      where: {
        room: { pension_id: id },
        status: { in: ['Pending', 'Confirmed'] }
      }
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete pension with active bookings'
      });
    }

    await prisma.pension.delete({
      where: { pension_id: id }
    });

    res.json({
      success: true,
      message: 'Pension deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's pensions (protected)
router.get('/my/pensions', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [pensionsResult, totalCount] = await prisma.$transaction([
      prisma.pension.findMany({
        where: { owner_id: userId },
        include: {
          _count: {
            select: { rooms: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take,
        skip
      }),
      prisma.pension.count({ where: { owner_id: userId } })
    ]);

    const formattedPensions = pensionsResult.map(p => ({
      ...p,
      room_count: p._count.rooms
    }));

    res.json({
      success: true,
      data: formattedPensions,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total: totalCount,
        pages: Math.ceil(totalCount / take)
      }
    });
  } catch (error: any) {
    console.error('Get user pensions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pensions'
    });
  }
});

// Update existing pensions with missing coordinates (admin only)
router.post('/update-coordinates', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const pensionsWithoutCoords = await prisma.pension.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: { pension_id: true, name: true, address: true }
    });
    
    console.log(`Found ${pensionsWithoutCoords.length} pensions without coordinates`);
    
    for (const pension of pensionsWithoutCoords) {
      if (pension.address) {
        try {
          const coordinates = await geocodingService.geocodeAddress(pension.address);
          await prisma.pension.update({
            where: { pension_id: pension.pension_id },
            data: {
              latitude: new Prisma.Decimal(coordinates.lat),
              longitude: new Prisma.Decimal(coordinates.lng)
            }
          });
        } catch (err) {
          console.warn(`Failed to geocode ${pension.name}`);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Updated coordinates for ${pensionsWithoutCoords.length} pensions`
    });
    
  } catch (error: any) {
    console.error('Error updating coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
