import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { getMultilingualText } from '../utils/multilingual';
import { RoomStatus, Prisma } from '@prisma/client';
import { checkSubscription } from '../middleware/checkSubscription';

const router = express.Router();

// Get room types for a pension
router.get('/pension/:pensionId/room-types', authenticateToken as any, async (req: express.Request, res: express.Response) => {
  try {
    const pensionId = parseInt(req.params.pensionId as string);
    
    if (isNaN(pensionId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const roomTypes = await prisma.room.findMany({
      where: { pension_id: pensionId },
      distinct: ['room_type'],
      select: { room_type: true },
      orderBy: { room_type: 'asc' }
    });
    
    res.json({
      success: true,
      data: roomTypes.map((type: any) => type.room_type)
    });
  } catch (error: any) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ success: false, message: 'Error fetching room types' });
  }
});

// Get rooms for a specific pension (public)
router.get('/pension/:pensionId', async (req: express.Request, res: express.Response) => {
  try {
    const pensionId = parseInt(req.params.pensionId as string);
    const { page = 1, limit = 10, language = 'en' } = req.query;
    
    if (isNaN(pensionId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [rooms, total] = await prisma.$transaction([
      prisma.room.findMany({
        where: { pension_id: pensionId },
        orderBy: { created_at: 'desc' },
        take,
        skip
      }),
      prisma.room.count({ where: { pension_id: pensionId } })
    ]);

    res.json({
      success: true,
      data: {
        items: rooms.map((r: any) => ({ 
          ...r, 
          id: r.room_id, 
          type: getMultilingualText(r.room_type_ml as any, language as string) || r.room_type,
          is_available: r.availability_status === RoomStatus.Available
        })),
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    });

  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get room by ID (public)
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { language = 'en' } = req.query;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID' });
    }

    const roomData = await prisma.room.findUnique({
      where: { room_id: id },
      include: {
        pension: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    if (!roomData) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({
      success: true,
      data: {
        room: { 
          ...roomData, 
          id: roomData.room_id, 
          pension_name: roomData.pension.name,
          pension_address: roomData.pension.address,
          type: getMultilingualText(roomData.room_type_ml as any, language as string) || roomData.room_type,
          is_available: roomData.availability_status === RoomStatus.Available
        }
      }
    });

  } catch (error: any) {
    console.error('Get room error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Create new room (protected)
router.post('/', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const { 
      pension_id, 
      room_type, 
      capacity, 
      price_per_night, 
      number_of_beds, 
      availability_status, 
      packageId,
      room_number,
      room_type_ml
    } = req.body;

    if (!pension_id || !room_type) {
      return res.status(400).json({ success: false, message: 'Pension ID and room type are required' });
    }

    // Check ownership
    const pension = await prisma.pension.findUnique({
      where: { 
        pension_id: parseInt(pension_id),
        owner_id: userId
      }
    });

    if (!pension) {
      return res.status(403).json({ success: false, message: 'Unauthorized or pension not found' });
    }

    const newRoom = await prisma.room.create({
      data: {
        pension_id: parseInt(pension_id),
        owner_id: userId,
        room_type,
        capacity: parseInt(capacity) || 1,
        price_per_night: new Prisma.Decimal(price_per_night),
        number_of_beds: parseInt(number_of_beds) || 1,
        availability_status: (availability_status as RoomStatus) || RoomStatus.Available,
        package_id: packageId ? parseInt(packageId) : null,
        room_number: room_number || null,
        room_type_ml: room_type_ml || { en: room_type }
      }
    });

    res.status(201).json({ success: true, message: 'Room created successfully', data: { id: newRoom.room_id } });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Update room (protected)
router.put('/:id', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    const { room_type, capacity, price_per_night, number_of_beds, availability_status, room_type_ml } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID' });
    }

    // Check ownership
    const room = await prisma.room.findUnique({
      where: { room_id: id },
      include: { pension: true }
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (room.pension.owner_id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.room.update({
      where: { room_id: id },
      data: {
        room_type: room_type || undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        price_per_night: price_per_night ? new Prisma.Decimal(price_per_night) : undefined,
        number_of_beds: number_of_beds ? parseInt(number_of_beds) : undefined,
        availability_status: (availability_status as RoomStatus) || undefined,
        room_type_ml: room_type_ml || undefined,
        last_status_update: availability_status ? new Date() : undefined
      }
    });

    res.json({ success: true, message: 'Room updated successfully' });
  } catch (error: any) {
    console.error('Update room error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Delete room (protected)
router.delete('/:id', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID' });
    }

    const room = await prisma.room.findUnique({
      where: { room_id: id },
      include: { pension: true }
    });

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.pension.owner_id !== userId && req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Unauthorized' });

    await prisma.room.delete({
      where: { room_id: id }
    });
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error: any) {
    console.error('Delete room error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get user's rooms
router.get('/my/rooms', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const { pension_id, page = 1, limit = 10, language = 'en' } = req.query;
    
    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const rooms = await prisma.room.findMany({
      where: {
        pension: { owner_id: userId },
        pension_id: pension_id ? parseInt(pension_id as string) : undefined
      },
      include: {
        pension: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' },
      take,
      skip
    });

    const normalizedRooms = rooms.map((r: any) => ({ 
      ...r, 
      id: r.room_id, 
      pension_name: r.pension.name,
      type: getMultilingualText(r.room_type_ml as any, language as string) || r.room_type,
      is_available: r.availability_status === RoomStatus.Available
    }));

    res.json({ success: true, data: { items: normalizedRooms } });
  } catch (error: any) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get room statistics for a pension
router.get('/stats/:pensionId', async (req: express.Request, res: express.Response) => {
  try {
    const pensionId = parseInt(req.params.pensionId as string);
    
    if (isNaN(pensionId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const totalRooms = await prisma.room.count({
      where: { pension_id: pensionId }
    });

    const availableRooms = await prisma.room.count({
      where: { 
        pension_id: pensionId,
        availability_status: RoomStatus.Available
      }
    });

    res.json({
      success: true,
      data: {
        totalRooms,
        availableRooms
      }
    });
  } catch (error: any) {
    console.error('Get room stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
