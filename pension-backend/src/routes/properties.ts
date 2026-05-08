import * as express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Simple test endpoint to verify route is working
router.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Properties route is working!',
    timestamp: new Date().toISOString()
  });
});

// Get property by ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const property = await prisma.pension.findUnique({
      where: { pension_id: id },
      include: {
        owner: {
          select: {
            full_name: true,
            email: true,
            phone: true
          }
        }
      }
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
          name: property.owner.full_name || 'Property Owner',
          email: property.owner.email || 'owner@example.com',
          phone: property.owner.phone || 'N/A'
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

export default router;
