import * as express from 'express';
import { executeQuery, executeTransaction } from '../config/database';
import { authenticateToken, requireAdmin, requireOwnerApproval } from '../middleware/auth';

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
}

// Get all pensions (protected) - Simple route for frontend
router.get('/', authenticateToken as any, requireOwnerApproval as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.userId;
    console.log('=== GET PENSIONS FOR USER ===');
    console.log('User ID:', userId);
    
    const pensions = await executeQuery(`
      SELECT p.pension_id as id, p.name, p.address, p.description, p.phone, p.email, p.capacity, p.image_url, p.owner_id,
             op.business_name
      FROM pensions p
      LEFT JOIN ownerprofiles op ON p.owner_id = op.owner_id
      WHERE p.owner_id = ?
    `, [userId]);
    console.log('Found pensions:', pensions.length);
    console.log('Pensions data:', pensions);
    
    res.json({
      success: true,
      data: pensions
    });
  } catch (error: any) {
    console.error('Get pensions error:', error);
    next(error);
  }
});

// Get pension by ID (public)
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const pensionResult = await executeQuery(`
      SELECT p.*, u.full_name as owner_name, u.email as owner_email,
             (SELECT COUNT(*) FROM rooms r WHERE r.pension_id = p.pension_id AND r.is_available = TRUE) as available_rooms,
             (SELECT AVG(rating) FROM reviews r WHERE r.pension_id = p.pension_id AND r.is_approved = TRUE) as avg_rating,
             (SELECT COUNT(*) FROM reviews r WHERE r.pension_id = p.pension_id AND r.is_approved = TRUE) as review_count
      FROM pensions p
      LEFT JOIN users u ON p.owner_id = u.user_id
      WHERE p.pension_id = ?
    `, [id]);

    if (pensionResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    const pension = { ...pensionResult[0], id: pensionResult[0].pension_id };

    // Get rooms for this pension
    const roomsResult = await executeQuery(
      'SELECT * FROM rooms WHERE pension_id = ? AND is_available = TRUE ORDER BY price_per_night',
      [id]
    );
    const rooms = roomsResult.map((r: any) => ({ ...r, id: r.room_id }));

    // Get packages for this pension
    let packages: any[] = [];
    try {
      const packagesResult = await executeQuery(
        'SELECT * FROM packages WHERE pension_id = ? AND is_active = TRUE ORDER BY price',
        [id]
      );
      packages = packagesResult.map((pkg: any) => ({ ...pkg, id: pkg.package_id || pkg.id }));
    } catch (e: any) {
      console.warn('Packages table not found or query failed');
      if ((pension as any).packages) {
        try {
          packages = typeof (pension as any).packages === 'string' ? JSON.parse((pension as any).packages) : (pension as any).packages;
        } catch (parseError: any) {
          console.error('Error parsing packages JSON:', parseError);
        }
      }
    }

    // Get recent reviews
    const reviewsResult = await executeQuery(`
      SELECT r.*, u.full_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.pension_id = ? AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [id]);
    const reviews = reviewsResult.map((rev: any) => ({ ...rev, id: rev.review_id }));

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

// Create new pension (protected)
router.post('/', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    console.log('=== CREATE PENSION DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);
    
    const {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details
    }: PensionData = req.body;

    console.log('Extracted values:', {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details
    });

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name and address are required'
      });
    }

    console.log('About to execute INSERT query...');
    const result = await executeQuery(
      `INSERT INTO pensions (name, description, owner_info, room_details, address, phone, email, capacity, owner_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [name, description, owner_info, room_details, address, phone, email, capacity || 0, userId]
    );

    console.log('INSERT result:', result);

    // Get created pension
    const newPension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ?',
      [result.insertId]
    );

    console.log('Created pension:', newPension[0]);

    res.status(201).json({
      success: true,
      message: 'Pension created successfully',
      data: newPension[0]
    });

  } catch (error: any) {
    console.error('Create pension error:', error);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.userId);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update pension (protected)
router.put('/:id', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    console.log('=== UPDATE PENSION DEBUG ===');
    console.log('User ID:', userId);
    console.log('Pension ID:', id);
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    
    const {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details
    }: PensionData = req.body;

    console.log('Extracted values:', {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details
    });

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name and address are required'
      });
    }

    // Check if user owns this pension or is admin
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ?',
      [id]
    );

    if (pension.length === 0) {
      console.log('Pension not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    if (pension[0].owner_id !== userId && req.user.role !== 'admin') {
      console.log('Ownership check failed. Pension owner:', pension[0].owner_id, 'User ID:', userId);
      return res.status(403).json({
        success: false,
        message: 'You can only update your own pensions'
      });
    }

    console.log('Ownership check passed. Updating pension...');
    
    // Update pension - only use columns that exist
    try {
      await executeQuery(
        `UPDATE pensions 
         SET name = ?, description = ?, owner_info = ?, room_details = ?, address = ?, phone = ?, email = ?, capacity = ?
         WHERE pension_id = ?`,
        [name, description, owner_info, room_details, address, phone, email, capacity || 0, id]
      );

      console.log('Pension updated successfully');
    } catch (error: any) {
      console.error('Error updating pension:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update pension',
        error: error.message
      });
    }

    // Get updated pension
    const updatedPension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Pension updated successfully',
      data: {
        pension: updatedPension[0]
      }
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
    const { id } = req.params;

    // Check if pension exists
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ?',
      [id]
    );

    if (pension.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Check if there are active bookings
    const activeBookings = await executeQuery(
      'SELECT COUNT(*) as count FROM bookings WHERE pension_id = ? AND status IN ("pending", "confirmed")',
      [id]
    );

    if (activeBookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete pension with active bookings'
      });
    }

    // Delete pension (cascade will handle related records)
    await executeQuery('DELETE FROM pensions WHERE pension_id = ?', [id]);

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
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const pensionsResult = await executeQuery(`
      SELECT p.*, COUNT(DISTINCT r.room_id) as room_count
      FROM pensions p
      LEFT JOIN rooms r ON p.pension_id = r.pension_id
      WHERE p.owner_id = ?
      GROUP BY p.pension_id
      ORDER BY p.created_at DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${offset}
    `, [userId]);

    const totalCount = await executeQuery(
      'SELECT COUNT(*) as count FROM pensions WHERE owner_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: pensionsResult,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / parseInt(limit as string))
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

export default router;
