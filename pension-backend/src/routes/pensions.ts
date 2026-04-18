import * as express from 'express';
import { executeQuery, executeTransaction } from '../config/database';
import { authenticateToken, requireAdmin, requireOwnerApproval } from '../middleware/auth';
import geocodingService from '../services/geocoding';
import { getMultilingualText } from '../utils/multilingual';

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
}

// Get all pensions (protected) - Simple route for frontend
router.get('/', authenticateToken as any, requireOwnerApproval as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.userId;
    const { language = 'en' } = req.query;
    console.log('=== GET PENSIONS FOR USER ===');
    console.log('User ID:', userId);
    
    const pensions = await executeQuery(`
      SELECT p.pension_id as id, p.name, p.address, p.description, p.phone, p.email, p.capacity, p.image_url, p.owner_id,
             p.name_ml, p.description_ml, p.owner_info_ml, p.room_details_ml,
             op.business_name, op.business_email, op.business_phone, op.license_number, op.approval_status
      FROM pensions p
      LEFT JOIN ownerprofiles op ON p.owner_id = op.owner_id
      WHERE p.owner_id = ?
    `, [userId]);
    console.log('Found pensions:', pensions.length);
    console.log('Pensions data:', pensions);
    
    // Apply multilingual text extraction
    const formattedPensions = pensions.map((p: any) => ({
      ...p,
      name: getMultilingualText(p.name_ml, language as string) || p.name,
      description: getMultilingualText(p.description_ml, language as string) || p.description,
      owner_info: getMultilingualText(p.owner_info_ml, language as string) || p.owner_info,
      room_details: getMultilingualText(p.room_details_ml, language as string) || p.room_details
    }));
    
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
    const { id } = req.params;
    const { language = 'en' } = req.query;

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

    const pensionData = pensionResult[0];
    const pension = { 
      ...pensionData, 
      id: pensionData.pension_id,
      name: getMultilingualText(pensionData.name_ml, language as string) || pensionData.name,
      description: getMultilingualText(pensionData.description_ml, language as string) || pensionData.description,
      owner_info: getMultilingualText(pensionData.owner_info_ml, language as string) || pensionData.owner_info,
      room_details: getMultilingualText(pensionData.room_details_ml, language as string) || pensionData.room_details
    };

    // Get rooms for this pension
    const roomsResult = await executeQuery(
      'SELECT * FROM rooms WHERE pension_id = ? AND is_available = TRUE ORDER BY price_per_night',
      [id]
    );
    const rooms = roomsResult.map((r: any) => ({ 
      ...r, 
      id: r.room_id,
      type: getMultilingualText(r.room_type_ml, language as string) || r.room_type
    }));

    // Get packages for this pension
    let packages: any[] = [];
    try {
      const packagesResult = await executeQuery(
        'SELECT * FROM packages WHERE pension_id = ? AND is_active = TRUE ORDER BY price',
        [id]
      );
      packages = packagesResult.map((pkg: any) => ({ 
        ...pkg, 
        id: pkg.package_id || pkg.id,
        name: getMultilingualText(pkg.name_ml, language as string) || pkg.name,
        description: getMultilingualText(pkg.description_ml, language as string) || pkg.description
      }));
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

// TEMPORARY: Add properties endpoint here to fix the 500 error
// This provides the property details structure expected by the frontend
router.get('/properties/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    console.log('=== GET PROPERTY BY ID (TEMP FIX) ===');
    console.log('Property ID:', id);

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
      room_details,
      image_url,
      name_ml,
      description_ml,
      owner_info_ml,
      room_details_ml
    }: PensionData & { name_ml?: any, description_ml?: any, owner_info_ml?: any, room_details_ml?: any } = req.body;

    console.log('Extracted values:', {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details,
      image_url
    });

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name and address are required'
      });
    }

    // Prepare multilingual fields
    const nameMlJson = name_ml ? JSON.stringify(name_ml) : JSON.stringify({ en: name });
    const descriptionMlJson = description_ml ? JSON.stringify(description_ml) : JSON.stringify({ en: description });
    const ownerInfoMlJson = owner_info_ml ? JSON.stringify(owner_info_ml) : JSON.stringify({ en: owner_info });
    const roomDetailsMlJson = room_details_ml ? JSON.stringify(room_details_ml) : JSON.stringify({ en: room_details });

    // Geocode address to get coordinates
    console.log(`🗺️ Geocoding address for new pension: "${address}"`);
    let coordinates = { lat: 9.03, lng: 38.74 }; // Default Addis Ababa coordinates
    
    if (address) {
      try {
        coordinates = await geocodingService.geocodeAddress(address);
        console.log(`✅ Geocoded "${name}" to coordinates:`, coordinates);
      } catch (error: any) {
        console.log(`⚠️ Geocoding failed for "${name}":`, (error as Error).message);
        console.log('📍 Using default Addis Ababa coordinates as fallback');
      }
    }

    console.log('About to execute INSERT query with coordinates...');
    
    // Always create pensions with 'pending' status for admin approval workflow
    const result = await executeQuery(
      `INSERT INTO pensions (name, description, owner_info, room_details, address, phone, email, capacity, latitude, longitude, owner_id, status, image_url, name_ml, description_ml, owner_info_ml, room_details_ml, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW())`,
      [name, description, owner_info, room_details, address, phone, email, capacity || 0, coordinates.lat, coordinates.lng, userId, image_url || null, nameMlJson, descriptionMlJson, ownerInfoMlJson, roomDetailsMlJson]
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
      room_details,
      image_url,
      name_ml,
      description_ml,
      owner_info_ml,
      room_details_ml
    }: PensionData & { name_ml?: any, description_ml?: any, owner_info_ml?: any, room_details_ml?: any } = req.body;

    console.log('Extracted values:', {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      owner_info,
      room_details,
      image_url
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
    
    // Prepare multilingual fields
    const nameMlJson = name_ml ? JSON.stringify(name_ml) : (pension[0].name_ml || JSON.stringify({ en: name || pension[0].name }));
    const descriptionMlJson = description_ml ? JSON.stringify(description_ml) : (pension[0].description_ml || JSON.stringify({ en: description || pension[0].description }));
    const ownerInfoMlJson = owner_info_ml ? JSON.stringify(owner_info_ml) : (pension[0].owner_info_ml || JSON.stringify({ en: owner_info || pension[0].owner_info }));
    const roomDetailsMlJson = room_details_ml ? JSON.stringify(room_details_ml) : (pension[0].room_details_ml || JSON.stringify({ en: room_details || pension[0].room_details }));
    
    // Geocode address to get updated coordinates
    console.log(`🗺️ Geocoding updated address for pension: "${address}"`);
    let coordinates = { lat: 9.03, lng: 38.74 }; // Default Addis Ababa coordinates
    
    if (address) {
      try {
        coordinates = await geocodingService.geocodeAddress(address);
        console.log(`✅ Re-geocoded "${name}" to coordinates:`, coordinates);
      } catch (error: any) {
        console.log(`⚠️ Re-geocoding failed for "${name}":`, (error as Error).message);
        console.log('📍 Using default Addis Ababa coordinates as fallback');
      }
    }
    
    // Update pension with coordinates
    try {
      await executeQuery(
        `UPDATE pensions 
         SET name = ?, description = ?, owner_info = ?, room_details = ?, address = ?, phone = ?, email = ?, capacity = ?, latitude = ?, longitude = ?, image_url = ?, name_ml = ?, description_ml = ?, owner_info_ml = ?, room_details_ml = ?
         WHERE pension_id = ?`,
        [name || pension[0].name, 
         description || pension[0].description, 
         owner_info || pension[0].owner_info, 
         room_details || pension[0].room_details, 
         address, 
         phone, 
         email, 
         capacity || 0, 
         coordinates.lat, 
         coordinates.lng, 
         image_url || null,
         nameMlJson,
         descriptionMlJson,
         ownerInfoMlJson,
         roomDetailsMlJson,
         id]
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

// Update existing pensions with missing coordinates (admin only)
router.post('/update-coordinates', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    console.log('=== UPDATING MISSING COORDINATES ===');
    
    // Get all pensions without coordinates
    const pensionsWithoutCoords = await executeQuery(`
      SELECT pension_id, name, address 
      FROM pensions 
      WHERE latitude IS NULL OR longitude IS NULL OR latitude = '' OR longitude = ''
    `);
    
    console.log(`Found ${pensionsWithoutCoords.length} pensions without coordinates`);
    
    for (const pension of pensionsWithoutCoords) {
      try {
        console.log(`🗺️ Geocoding address for pension "${pension.name}": "${pension.address}"`);
        const coordinates = await geocodingService.geocodeAddress(pension.address);
        
        await executeQuery(`
          UPDATE pensions 
          SET latitude = ?, longitude = ? 
          WHERE pension_id = ?
        `, [coordinates.lat, coordinates.lng, pension.pension_id]);
        
        console.log(`✅ Updated coordinates for "${pension.name}":`, coordinates);
        
      } catch (error: any) {
        console.log(`⚠️ Failed to geocode "${pension.name}":`, error.message);
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
