import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { PaymentStatus, PaymentType, SubscriptionStatus } from '@prisma/client';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin Payments Router is active' });
});

// Get all subscription plans (including private ones)
router.get('/plans', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new subscription plan
router.post('/plans', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { name, price, duration_days, features, is_active, is_public } = req.body;
  try {
    console.log('📝 Creating new plan:', { name, price, duration_days });
    
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        price: parseFloat(price.toString()),
        duration_days: parseInt(String(duration_days)),
        features: Array.isArray(features) ? features : (typeof features === 'string' ? JSON.parse(features) : []),
        is_active: is_active ?? true,
        is_public: is_public ?? true
      }
    });
    
    // Log action
    await prisma.auditLog.create({
      data: {
        user_id: parseInt(String((req as any).user.userId)),
        action: 'PLAN_CREATED',
        entity_type: 'SUBSCRIPTION_PLAN',
        entity_id: plan.plan_id,
        details: `Created plan: ${name}`
      }
    });

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a subscription plan
router.put('/plans/:id', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { name, price, duration_days, features, is_active, is_public } = req.body;
  try {
    console.log(`Update request for plan ${id}:`, req.body);
    
    const planId = parseInt(String(id));
    const plan = await prisma.subscriptionPlan.update({
      where: { plan_id: planId },
      data: {
        name,
        price: price ? parseFloat(price.toString()) : undefined,
        duration_days: duration_days ? parseInt(String(duration_days)) : undefined,
        features: features ? (Array.isArray(features) ? features : (typeof features === 'string' ? JSON.parse(features) : [])) : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
        is_public: is_public !== undefined ? is_public : undefined
      }
    });

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all subscriptions with owner details
router.get('/subscriptions', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      distinct: ['owner_id'],
      include: {
        owner: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true,
            ownerProfile: true
          }
        },
        plan: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: subscriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Manual Override / Free Access
router.post('/subscriptions/override', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { ownerId, planId, durationDays, isFree, reason } = req.body;
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(String(durationDays)));

    const subscription = await prisma.subscription.create({
      data: {
        owner_id: parseInt(String(ownerId)),
        plan_id: parseInt(String(planId)),
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
        is_free: isFree ?? false,
        admin_override: true,
        override_reason: reason
      }
    });

    // Ensure user is approved
    await prisma.user.update({
      where: { user_id: parseInt(String(ownerId)) },
      data: { status: 'Approved', approved: 1 }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: parseInt(String((req as any).user.userId)),
        action: 'SUB_OVERRIDE',
        entity_type: 'SUBSCRIPTION',
        entity_id: subscription.subscription_id,
        details: `Granted ${durationDays} days access to owner ${ownerId}. Reason: ${reason}`
      }
    });

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Payment Stats
router.get('/stats', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true }
    });

    const activeSubs = await prisma.subscription.count({
      where: { status: SubscriptionStatus.ACTIVE, end_date: { gt: new Date() } }
    });

    const expiredSubs = await prisma.subscription.count({
      where: { OR: [{ status: SubscriptionStatus.EXPIRED }, { end_date: { lte: new Date() } }] }
    });

    const freeUsers = await prisma.subscription.count({
      where: { is_free: true, status: SubscriptionStatus.ACTIVE }
    });
    
    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { status: PaymentStatus.PAID },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        user: { select: { full_name: true, email: true } }
      }
    });

    // Calculate trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID, created_at: { gte: thirtyDaysAgo } },
      _sum: { amount: true }
    });

    const newActiveSubs = await prisma.subscription.count({
      where: { status: SubscriptionStatus.ACTIVE, created_at: { gte: thirtyDaysAgo } }
    });

    const recentExpiredSubs = await prisma.subscription.count({
      where: { status: SubscriptionStatus.EXPIRED, updated_at: { gte: thirtyDaysAgo } }
    });

    const newFreeUsers = await prisma.subscription.count({
      where: { is_free: true, created_at: { gte: thirtyDaysAgo } }
    });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscriptions: activeSubs,
        expiredSubscriptions: expiredSubs,
        freeAccessUsers: freeUsers,
        revenueTrend: `+${recentRevenue._sum.amount || 0} ETB this month`,
        activeSubsTrend: `+${newActiveSubs} this month`,
        expiredSubsTrend: `+${recentExpiredSubs} this month`,
        freeUsersTrend: `+${newFreeUsers} this month`,
        recentPayments
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Extend Subscription
router.post('/subscriptions/:id/extend', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { durationDays } = req.body;
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { subscription_id: parseInt(String(id)) }
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // If already expired, start from today. If active, add to existing end date.
    let currentEndDate = new Date(subscription.end_date);
    if (currentEndDate < new Date()) {
      currentEndDate = new Date();
    }
    
    currentEndDate.setDate(currentEndDate.getDate() + parseInt(String(durationDays)));

    const updatedSub = await prisma.subscription.update({
      where: { subscription_id: parseInt(String(id)) },
      data: { 
        end_date: currentEndDate,
        status: SubscriptionStatus.ACTIVE
      }
    });

    // Ensure owner is approved if we just extended them
    await prisma.user.update({
      where: { user_id: subscription.owner_id },
      data: { status: 'Approved', approved: 1 }
    });

    await prisma.auditLog.create({
      data: {
        user_id: parseInt(String((req as any).user.userId)),
        action: 'SUB_EXTEND',
        entity_type: 'SUBSCRIPTION',
        entity_id: updatedSub.subscription_id,
        details: `Extended subscription by ${durationDays} days. New expiry: ${currentEndDate.toISOString()}`
      }
    });

    res.json({ success: true, data: updatedSub });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Terminate Free Access
router.post('/subscriptions/:id/terminate-free', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const updatedSub = await prisma.subscription.update({
      where: { subscription_id: parseInt(String(id)) },
      data: { 
        is_free: false,
        end_date: new Date(), // Expire immediately
        status: SubscriptionStatus.EXPIRED 
      }
    });

    await prisma.auditLog.create({
      data: {
        user_id: parseInt(String((req as any).user.userId)),
        action: 'SUB_TERMINATE_FREE',
        entity_type: 'SUBSCRIPTION',
        entity_id: updatedSub.subscription_id,
        details: `Terminated free access for subscription ID ${id}`
      }
    });

    res.json({ success: true, data: updatedSub });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Terminate Subscription (General)
router.post('/subscriptions/:id/terminate', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const updatedSub = await prisma.subscription.update({
      where: { subscription_id: parseInt(String(id)) },
      data: { 
        end_date: new Date(), 
        status: SubscriptionStatus.EXPIRED 
      }
    });

    await prisma.auditLog.create({
      data: {
        user_id: parseInt(String((req as any).user.userId)),
        action: 'SUB_TERMINATE',
        entity_type: 'SUBSCRIPTION',
        entity_id: updatedSub.subscription_id,
        details: `Terminated subscription ID ${id}`
      }
    });

    res.json({ success: true, data: updatedSub });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle Subscription Status (Activate/Cancel)
router.post('/subscriptions/:id/toggle-status', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  let { status } = req.body; // Expects 'ACTIVE' or 'CANCELLED'
  
  try {
    // Map DEACTIVATED to CANCELLED for backwards compatibility with older clients
    if (status === 'DEACTIVATED') {
      status = 'CANCELLED';
    }

    if (status !== 'ACTIVE' && status !== 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updatedSub = await prisma.subscription.update({
      where: { subscription_id: parseInt(String(id)) },
      data: { status: status as SubscriptionStatus }
    });

    await prisma.auditLog.create({
      data: {
        user_id: parseInt(String((req as any).user.userId)),
        action: 'SUB_TOGGLE_STATUS',
        entity_type: 'SUBSCRIPTION',
        entity_id: updatedSub.subscription_id,
        details: `Changed subscription status to ${status}`
      }
    });

    res.json({ success: true, data: updatedSub });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
