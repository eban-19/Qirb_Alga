import * as express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import prisma from '../lib/prisma';
import { PolicyCategory, AdjustmentType, Prisma } from '@prisma/client';
import pricingService from '../services/pricingService';

const router = express.Router();

// Preview pricing calculation
router.post('/preview', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const { pension_id, room_id, package_id, check_in, check_out, base_price } = req.body;
    
    if (!pension_id || !check_in || !check_out || !base_price) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    
    const result = await pricingService.calculateBookingPrice(
      parseInt(pension_id),
      room_id ? parseInt(room_id) : null,
      package_id ? parseInt(package_id) : null,
      checkInDate,
      checkOutDate,
      parseFloat(base_price)
    );
    
    res.json({ success: true, preview: result });
  } catch (error) {
    console.error('Error in pricing preview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public: Get active policies for a specific pension
router.get('/public/:pensionId', async (req: any, res) => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    
    if (isNaN(pensionId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }
    
    const policies = await prisma.pricingPolicy.findMany({
      where: { 
        pension_id: pensionId,
        is_active: true
      },
      orderBy: { priority: 'desc' }
    });
    

    res.json({ success: true, policies });
  } catch (error) {
    console.error('Error fetching public pricing policies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all policies for an owner's pensions
router.get('/', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const pensions = await prisma.pension.findMany({
      where: { owner_id: userId },
      select: { pension_id: true }
    });
    
    const pensionIds = pensions.map(p => p.pension_id);
    
    const policies = await prisma.pricingPolicy.findMany({
      where: { pension_id: { in: pensionIds } },
      include: {
        room: true,
        package: true,
        pension: true
      },
      orderBy: { priority: 'desc' }
    });
    
    res.json({ success: true, policies });
  } catch (error) {
    console.error('Error fetching pricing policies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new policy
router.post('/', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const {
      pension_id, room_id, package_id, name, category, description,
      rules, start_date, end_date, min_nights, max_nights,
      adjustment_type, adjustment_value,
      priority, is_active
    } = req.body;
    
    const parsedPensionId = parseInt(pension_id);
    
    // Verify ownership
    const pension = await prisma.pension.findUnique({ where: { pension_id: parsedPensionId } });
    if (!pension || pension.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    const policy = await prisma.pricingPolicy.create({
      data: {
        pension_id: parsedPensionId,
        room_id,
        package_id,
        name,
        category,
        description,
        rules: rules || {},
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        min_nights: min_nights !== undefined ? parseInt(min_nights) : null,
        max_nights: max_nights !== undefined ? parseInt(max_nights) : null,
        adjustment_type,
        adjustment_value: adjustment_value !== undefined ? new Prisma.Decimal(adjustment_value) : null,
        priority: priority !== undefined ? parseInt(priority) : 0,
        is_active: is_active !== undefined ? is_active : true
      }
    });
    
    res.json({ success: true, policy });
  } catch (error) {
    console.error('Error creating pricing policy:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an existing policy
router.put('/:id', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const policyId = parseInt(req.params.id);
    
    const existingPolicy = await prisma.pricingPolicy.findUnique({
      where: { policy_id: policyId },
      include: { pension: true }
    });
    
    if (!existingPolicy || existingPolicy.pension.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    const {
      room_id, package_id, name, category, description,
      rules, start_date, end_date, min_nights, max_nights,
      adjustment_type, adjustment_value,
      priority, is_active
    } = req.body;
    
    const policy = await prisma.pricingPolicy.update({
      where: { policy_id: policyId },
      data: {
        room_id,
        package_id,
        name,
        category,
        description,
        rules: rules !== undefined ? rules : existingPolicy.rules,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        min_nights: min_nights !== undefined ? parseInt(min_nights) : null,
        max_nights: max_nights !== undefined ? parseInt(max_nights) : null,
        adjustment_type,
        adjustment_value: adjustment_value !== undefined ? new Prisma.Decimal(adjustment_value) : null,
        priority: priority !== undefined ? parseInt(priority) : existingPolicy.priority,
        is_active: is_active !== undefined ? is_active : existingPolicy.is_active
      }
    });
    
    res.json({ success: true, policy });
  } catch (error) {
    console.error('Error updating pricing policy:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a policy
router.delete('/:id', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const policyId = parseInt(req.params.id);
    
    const existingPolicy = await prisma.pricingPolicy.findUnique({
      where: { policy_id: policyId },
      include: { pension: true }
    });
    
    if (!existingPolicy || existingPolicy.pension.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    await prisma.pricingPolicy.delete({
      where: { policy_id: policyId }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing policy:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
