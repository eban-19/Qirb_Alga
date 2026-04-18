import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { getMultilingualText, updateMultilingualField } from '../utils/multilingual';

const router = express.Router();

// Get room types for a pension
router.get('/pension/:pensionId/room-types', authenticateToken as any, async (req: express.Request, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    
    const roomTypes = await executeQuery(
      'SELECT DISTINCT room_type FROM rooms WHERE pension_id = ? ORDER BY room_type',
      [pensionId]
    );
    
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
    const { pensionId } = req.params;
    const { page = 1, limit = 10, language = 'en' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const rooms = await executeQuery(
      'SELECT r.* FROM rooms r WHERE r.pension_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?',
      [pensionId, parseInt(limit as string), offset]
    );

    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM rooms WHERE pension_id = ?',
      [pensionId]
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        items: rooms.map((r: any) => ({ 
          ...r, 
          id: r.room_id, 
          type: getMultilingualText(r.room_type_ml, language as string) || r.room_type,
          is_available: r.availability_status?.toLowerCase() === 'available'
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
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
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const room = await executeQuery(`
      SELECT r.*, p.name as pension_name, p.address as pension_address
      FROM rooms r
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.room_id = ?
    `, [id]);

    if (room.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({
      success: true,
      data: {
        room: { 
          ...room[0], 
          id: room[0].room_id, 
          type: getMultilingualText(room[0].room_type_ml, language as string) || room[0].room_type,
          is_available: room[0].availability_status?.toLowerCase() === 'available'
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

    console.log('🔍 Room creation request:', {
      pension_id, room_type, capacity, price_per_night, number_of_beds, availability_status, packageId, room_number, room_type_ml
    });

    // Validation
    if (!pension_id || !room_type) {
      return res.status(400).json({ success: false, message: 'Pension ID and room type are required' });
    }

    // Check ownership
    const pension = await executeQuery('SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?', [pension_id, userId]);
    if (pension.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Prepare multilingual field
    const roomTypeMlJson = room_type_ml ? JSON.stringify(room_type_ml) : JSON.stringify({ en: room_type });

    const result = await executeQuery(
      `INSERT INTO rooms (pension_id, owner_id, room_type, capacity, price_per_night, number_of_beds, availability_status, package_id, room_number, room_type_ml, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [pension_id, userId, room_type, capacity || 1, price_per_night, number_of_beds || 1, availability_status, packageId, room_number, roomTypeMlJson]
    );

    console.log('🔍 Room insertion data:', {
      pension_id, userId, room_type, capacity, price_per_night, number_of_beds, availability_status, packageId, room_number, roomTypeMlJson
    });

    res.status(201).json({ success: true, message: 'Room created successfully', data: { id: result.insertId } });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Update room (protected)
router.put('/:id', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { room_type, capacity, price_per_night, number_of_beds, availability_status, room_type_ml } = req.body;

    // Check ownership
    const room = await executeQuery('SELECT r.*, p.owner_id FROM rooms r JOIN pensions p ON r.pension_id = p.pension_id WHERE r.room_id = ?', [id]);
    if (room.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (room[0].owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Prepare multilingual field update
    let roomTypeMlJson;
    if (room_type_ml) {
      roomTypeMlJson = JSON.stringify(room_type_ml);
    } else if (room[0].room_type_ml) {
      // Keep existing multilingual field if not provided
      roomTypeMlJson = room[0].room_type_ml;
    } else {
      roomTypeMlJson = JSON.stringify({ en: room_type || room[0].room_type });
    }

    await executeQuery(
      `UPDATE rooms 
       SET room_type = ?, capacity = ?, price_per_night = ?, number_of_beds = ?, availability_status = ?, room_type_ml = ?, last_status_update = NOW()
       WHERE room_id = ?`,
      [room_type || room[0].room_type, 
       capacity || room[0].capacity, 
       price_per_night || room[0].price_per_night, 
       number_of_beds || room[0].number_of_beds,
       availability_status || room[0].availability_status,
       roomTypeMlJson,
       id]
    );

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
    const { id } = req.params;

    const room = await executeQuery('SELECT r.*, p.owner_id FROM rooms r JOIN pensions p ON r.pension_id = p.pension_id WHERE r.room_id = ?', [id]);
    if (room.length === 0) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room[0].owner_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await executeQuery('DELETE FROM rooms WHERE room_id = ?', [id]);
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
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT r.*, p.name as pension_name
      FROM rooms r
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    const params: any[] = [userId];

    if (pension_id) {
      query += ' AND r.pension_id = ?';
      params.push(pension_id);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), offset);

    const rooms = await executeQuery(query, params);
    const normalizedRooms = rooms.map((r: any) => ({ 
      ...r, 
      id: r.room_id, 
      type: getMultilingualText(r.room_type_ml, language as string) || r.room_type,
      is_available: r.availability_status?.toLowerCase() === 'available'
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
    const { pensionId } = req.params;
    
    const roomStats = await executeQuery(`
      SELECT 
        COUNT(*) as totalRooms,
        SUM(CASE WHEN availability_status = 'Available' THEN 1 ELSE 0 END) as availableRooms
      FROM rooms 
      WHERE pension_id = ?
    `, [pensionId]);

    res.json({
      success: true,
      data: {
        totalRooms: roomStats[0].totalRooms || 0,
        availableRooms: roomStats[0].availableRooms || 0
      }
    });
  } catch (error: any) {
    console.error('Get room stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
