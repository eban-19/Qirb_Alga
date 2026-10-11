import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireSubscription } from '../middleware/auth';
import { validateName, validateEmail, validatePhone, validatePrice, validateRequiredText } from '../utils/validation';

const router = express.Router();

interface StaffData {
  full_name: string;
  role: string; // Frontend sends 'role' instead of 'position'
  phone: string;
  salary: number;
  email?: string;
  status?: string;
}

// Get all staff for a pension
router.get('/pensions/:pensionId', authenticateToken as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const pId = parseInt(pensionId);

    // Check ownership
    const pension = await prisma.pension.findUnique({
      where: { 
        pension_id: pId,
        owner_id: userId
      }
    });

    if (!pension && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const staffResult = await prisma.staff.findMany({
      where: { pension_id: pId },
      orderBy: { name: 'asc' }
    });

    const staff = staffResult.map((s: any) => ({ 
      ...s, 
      id: s.staff_id,
      full_name: s.name,   // map name -> full_name
      name: s.name,
      role: s.position,    // map position -> role for frontend compatibility
    }));
    res.json({ success: true, data: staff });
  } catch (error: any) {
    console.error('Get staff error:', error);
    next(error);
  }
});

// Add staff member
router.post('/pensions/:pensionId', authenticateToken as any, requireSubscription as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const pId = parseInt(pensionId);
    const { full_name, role, phone, salary, email, status } = req.body;

    // Map frontend field names to backend field names
    const name = full_name;
    const position = role; // Frontend sends 'role' instead of 'position'

    const errors: Record<string, string> = {};
    const nameErr = validateName(name, 'Staff name', true);
    if (nameErr) errors.name = nameErr;

    const posErr = validateRequiredText(position, 'Staff position / role', 2, 50);
    if (posErr) errors.position = posErr;

    if (phone) {
      const phoneErr = validatePhone(phone, false, false, 'Phone number');
      if (phoneErr) errors.phone = phoneErr;
    }

    if (email) {
      const emailErr = validateEmail(email, false, 'Email address');
      if (emailErr) errors.email = emailErr;
    }

    if (salary !== undefined && salary !== null && salary !== '') {
      const salErr = validatePrice(salary, 'Salary', false, 0);
      if (salErr) errors.salary = salErr;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors
      });
    }

    // Check ownership
    const pension = await prisma.pension.findUnique({
      where: { 
        pension_id: pId,
        owner_id: userId
      }
    });

    if (!pension && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const staff = await prisma.staff.create({
      data: {
        pension_id: pId,
        name,
        position,
        phone,
        salary,
        email,
        status: status || 'active',
        hire_date: new Date()
      }
    });

    res.status(201).json({ success: true, message: 'Staff member added', data: { id: staff.staff_id } });
  } catch (error: any) {
    console.error('Add staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Update staff member
router.put('/:id', authenticateToken as any, requireSubscription as any, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const sId = parseInt(id);
    const { full_name, role, phone, salary, email, status } = req.body;

    // Map frontend field names to backend field names
    const name = full_name;
    const position = role; // Frontend sends 'role' instead of 'position'

    // Validate required fields
    if (name !== undefined && (!name || name.trim() === '')) {
      return res.status(400).json({ success: false, message: 'Staff name is required' });
    }
    if (position !== undefined && (!position || position.trim() === '')) {
      return res.status(400).json({ success: false, message: 'Staff position is required' });
    }

    // Check ownership
    const staffCheck = await prisma.staff.findUnique({
      where: { staff_id: sId },
      include: {
        pension: { select: { owner_id: true } }
      }
    });

    if (!staffCheck) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (staffCheck.pension?.owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.staff.update({
      where: { staff_id: sId },
      data: {
        name: name !== undefined ? name : undefined,
        position: position !== undefined ? position : undefined,
        phone,
        salary,
        email,
        status
      }
    });

    res.json({ success: true, message: 'Staff member updated' });
  } catch (error: any) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken as any, requireSubscription as any, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const sId = parseInt(id);

    const staffCheck = await prisma.staff.findUnique({
      where: { staff_id: sId },
      include: {
        pension: { select: { owner_id: true } }
      }
    });

    if (!staffCheck) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (staffCheck.pension?.owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.staff.delete({
      where: { staff_id: sId }
    });

    res.json({ success: true, message: 'Staff member deleted' });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

export default router;
