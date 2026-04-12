import * as express from 'express';
import { executeQuery } from '../config/database';

const router = express.Router();

// Simple test endpoint to verify route is working
router.get('/', (req: express.Request, res: express.Response) => {
  console.log('=== PROPERTIES ROUTE TEST ===');
  res.json({
    success: true,
    message: 'Properties route is working!',
    timestamp: new Date().toISOString()
  });
});

// Get property by ID (minimal test version)
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    console.log('=== GET PROPERTY BY ID ===');
    console.log('Property ID:', id);

    // Simple test query first
    const testResult = await executeQuery('SELECT 1 as test');
    console.log('Database test result:', testResult);

    // Get basic property info
    const propertyResult = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ?',
      [id]
    );

    console.log('Property result:', propertyResult);

    if (propertyResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const property = propertyResult[0];

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

export default router;
