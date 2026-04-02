import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface StaffData {
  full_name: string;
  role: string;
  phone: string;
  salary: number;
  department: string;
  email: string;
  status: string;
}

// Get all staff for a pension
router.get('/pensions/:pensionId', authenticateToken as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const pension = await executeQuery('SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?', [pensionId, userId]);
    if (pension.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const staffResult = await executeQuery('SELECT * FROM staff WHERE pension_id = ? ORDER BY full_name', [pensionId]);
    const staff = staffResult.map((s: any) => ({ 
      ...s, 
      id: s.staff_id,
      full_name: s.full_name, // Keep original field name
      name: s.full_name // Also provide name for compatibility
    }));
    res.json({ success: true, data: staff });
  } catch (error: any) {
    console.error('Get staff error:', error);
    next(error);
  }
});

// Add staff member
router.post('/pensions/:pensionId', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const { full_name, role, phone, salary, department, email, status }: StaffData = req.body;

    // Check ownership
    const pension = await executeQuery('SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?', [pensionId, userId]);
    if (pension.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await executeQuery(
      'INSERT INTO staff (pension_id, owner_id, full_name, role, phone, salary, department, email, status, hired_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [pensionId, userId, full_name, role, phone, salary, department, email, status || 'active']
    );

    res.status(201).json({ success: true, message: 'Staff member added', data: { id: result.insertId } });
  } catch (error: any) {
    console.error('Add staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Update staff member
router.put('/:id', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { full_name, role, phone, salary, department, email, status }: StaffData = req.body;

    // Check ownership
    const staffCheck = await executeQuery(
      'SELECT s.* FROM staff s JOIN pensions p ON s.pension_id = p.pension_id WHERE s.staff_id = ? AND p.owner_id = ?',
      [id, userId]
    );
    if (staffCheck.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await executeQuery(
      'UPDATE staff SET full_name = ?, role = ?, phone = ?, salary = ?, department = ?, email = ?, status = ? WHERE staff_id = ?',
      [full_name, role, phone, salary, department, email, status, id]
    );

    res.json({ success: true, message: 'Staff member updated' });
  } catch (error: any) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const staffCheck = await executeQuery(
      'SELECT s.* FROM staff s JOIN pensions p ON s.pension_id = p.pension_id WHERE s.staff_id = ? AND p.owner_id = ?',
      [id, userId]
    );
    if (staffCheck.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await executeQuery('DELETE FROM staff WHERE staff_id = ?', [id]);
    res.json({ success: true, message: 'Staff member deleted' });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

export default router;
