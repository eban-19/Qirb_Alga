import * as express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get room types for a pension
router.get('/pension/:pensionId/room-types', async (req: express.Request, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const pId = parseInt(pensionId as string);
    
    const rooms = await prisma.room.findMany({
      where: { pension_id: pId },
      distinct: ['room_type'],
      select: { room_type: true },
      orderBy: { room_type: 'asc' }
    });
    
    res.json({
      success: true,
      data: rooms.map((r: any) => r.room_type)
    });
  } catch (error: any) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ success: false, message: 'Error fetching room types' });
  }
});

export default router;
