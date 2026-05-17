import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to ensure user is a pension owner
const isOwner = (req: any, res: express.Response, next: express.NextFunction) => {
  const role = req.user?.role?.toLowerCase();
  if (role !== 'owner' && role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only owners can access promotions' });
  }
  next();
};

// Get all promotions for the logged-in owner
router.get('/', authenticateToken, isOwner, async (req: any, res: express.Response) => {
  try {
    const ownerId = req.user.userId;

    const pensions = await prisma.pension.findMany({
      where: { owner_id: ownerId },
      select: { pension_id: true, name: true }
    });

    if (pensions.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const pensionIds = pensions.map(p => p.pension_id);

    const promotions = await prisma.promotion.findMany({
      where: { pension_id: { in: pensionIds } },
      include: {
        pension: { select: { name: true } },
        package: { select: { package_id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: promotions });
  } catch (error) {
    console.error('Fetch promotions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new promotion
router.post('/', authenticateToken, isOwner, async (req: any, res: express.Response) => {
  try {
    const ownerId = req.user.userId;
    const { pension_id, type, name, description, discount_percent, min_days, max_days, start_date, end_date, package_id } = req.body;

    // Verify ownership
    const pension = await prisma.pension.findFirst({
      where: { pension_id: parseInt(pension_id), owner_id: ownerId }
    });

    if (!pension) {
      return res.status(403).json({ success: false, message: 'Not authorized for this pension' });
    }

    const promotion = await prisma.promotion.create({
      data: {
        pension_id: parseInt(pension_id),
        package_id: package_id ? parseInt(package_id) : null,
        type,
        name,
        description,
        discount_percent: parseInt(discount_percent),
        min_days: min_days ? parseInt(min_days) : null,
        max_days: max_days ? parseInt(max_days) : null,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        is_active: true
      }
    });

    res.json({ success: true, data: promotion, message: 'Promotion created successfully' });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a promotion (including toggle active)
router.put('/:id', authenticateToken, isOwner, async (req: any, res: express.Response) => {
  try {
    const ownerId = req.user.userId;
    const promoId = parseInt(req.params.id);
    const { name, description, discount_percent, min_days, max_days, start_date, end_date, is_active, package_id } = req.body;

    // Verify ownership via pension
    const existingPromo = await prisma.promotion.findUnique({
      where: { promo_id: promoId },
      include: { pension: true }
    });

    if (!existingPromo || existingPromo.pension.owner_id !== ownerId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discount_percent !== undefined) updateData.discount_percent = parseInt(discount_percent);
    if (min_days !== undefined) updateData.min_days = min_days ? parseInt(min_days) : null;
    if (max_days !== undefined) updateData.max_days = max_days ? parseInt(max_days) : null;
    if (start_date !== undefined) updateData.start_date = start_date ? new Date(start_date) : null;
    if (end_date !== undefined) updateData.end_date = end_date ? new Date(end_date) : null;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (package_id !== undefined) updateData.package_id = package_id ? parseInt(package_id) : null;

    const promotion = await prisma.promotion.update({
      where: { promo_id: promoId },
      data: updateData
    });

    res.json({ success: true, data: promotion, message: 'Promotion updated successfully' });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a promotion
router.delete('/:id', authenticateToken, isOwner, async (req: any, res: express.Response) => {
  try {
    const ownerId = req.user.userId;
    const promoId = parseInt(req.params.id);

    const existingPromo = await prisma.promotion.findUnique({
      where: { promo_id: promoId },
      include: { pension: true }
    });

    if (!existingPromo || existingPromo.pension.owner_id !== ownerId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.promotion.delete({
      where: { promo_id: promoId }
    });

    res.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
