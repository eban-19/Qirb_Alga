import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get bookings for the authenticated customer
router.get('/bookings', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    if (req.user.role !== 'Customer') {
      // Allow Owners to see their own customer profile too if they book something
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customer_id: userId
      },
      include: {
        room: {
          include: {
            pension: true,
            package: true
          }
        },
        payment: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error: any) {
    console.error('Fetch customer bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

export default router;
