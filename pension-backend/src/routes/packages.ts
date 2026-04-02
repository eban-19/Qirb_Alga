import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get packages for a specific pension (with real-time room counts)
router.get('/pensions/:pensionId', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    
    // Get packages and count available rooms for each
    const packages = await executeQuery(`
      SELECT pk.*, 
             (SELECT COUNT(*) 
              FROM rooms r 
              WHERE r.pension_id = pk.pension_id 
                AND r.room_type = pk.name 
                AND r.availability_status = 'available') as availableRooms
      FROM packages pk
      WHERE pk.pension_id = ?
      ORDER BY pk.price ASC
    `, [pensionId]);
    
    // Parse JSON services
    const formattedPackages = packages.map((pkg: any) => ({
      ...pkg,
      id: pkg.package_id,
      services: typeof pkg.services === 'string' ? JSON.parse(pkg.services) : (pkg.services || [])
    }));
    
    res.json({
      success: true,
      data: formattedPackages
    });
  } catch (error: any) {
    console.error('Get pension packages error:', error);
    next(error);
  }
});

// Get package by ID
router.get('/:id', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const packages = await executeQuery('SELECT * FROM packages WHERE package_id = ?', [id]);
    
    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    const pkg = packages[0];
    res.json({
      success: true,
      data: {
        ...pkg,
        id: pkg.package_id,
        services: typeof pkg.services === 'string' ? JSON.parse(pkg.services) : (pkg.services || [])
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// Create new package
router.post('/pensions/:pensionId', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    const { name, description, price, services, is_most_popular, image_url } = req.body;
    
    const result = await executeQuery(
      'INSERT INTO packages (pension_id, name, description, price, services, is_most_popular, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [pensionId, name, description, price, JSON.stringify(services || []), is_most_popular ? 1 : 0, image_url]
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        pension_id: parseInt(pensionId as string),
        name,
        description,
        price,
        services: services || [],
        is_most_popular,
        availableRooms: 0
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// Update package
router.put('/:id', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, services, is_most_popular, image_url } = req.body;
    
    const result = await executeQuery(
      'UPDATE packages SET name = ?, description = ?, price = ?, services = ?, is_most_popular = ?, image_url = ? WHERE package_id = ?',
      [name, description, price, JSON.stringify(services || []), is_most_popular ? 1 : 0, image_url, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Package updated successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

// Delete package
router.delete('/:id', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    await executeQuery('DELETE FROM packages WHERE package_id = ?', [id]);
    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
