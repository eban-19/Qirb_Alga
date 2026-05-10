import express from 'express';
import { PrismaClient } from '@prisma/client';
import { initializePayment, verifyPayment } from '../services/chapaService';

const router = express.Router();
const prisma = new PrismaClient();

// Get all active subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { is_active: true }
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
});

// Check subscription status for an owner
router.get('/status/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  
  try {
    const owner = await prisma.user.findUnique({
      where: { user_id: parseInt(ownerId) },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { end_date: 'desc' },
          take: 1,
          include: { plan: true }
        }
      }
    });

    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });

    const subscription = owner.subscriptions[0];
    const trialDays = 14;
    const trialExpiry = new Date(owner.created_at!.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const isTrialActive = new Date() < trialExpiry;
    const trialDaysLeft = Math.max(0, Math.ceil((trialExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      data: {
        hasActiveSubscription: !!subscription && new Date() < subscription.end_date,
        subscription,
        trial: {
          isActive: isTrialActive,
          daysLeft: trialDaysLeft,
          expiryDate: trialExpiry
        },
        isRestricted: !isTrialActive && (!subscription || new Date() > subscription.end_date)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check status' });
  }
});

// Initialize Subscription Payment
router.post('/initialize', async (req, res) => {
  const { ownerId, planId, email, firstName, lastName } = req.body;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { plan_id: parseInt(planId) } });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const txRef = `SUB-${ownerId}-${planId}-${Date.now()}`;
    
    const payment = await prisma.payment.create({
      data: {
        reference: txRef,
        amount: plan.price,
        currency: 'ETB',
        status: 'PENDING',
        type: 'SUBSCRIPTION',
        user_id: parseInt(ownerId),
      },
    });

    const chapaData = {
      amount: plan.price.toString(),
      currency: 'ETB',
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      return_url: `${process.env.FRONTEND_URL}/owner/subscription/verify?ref=${txRef}`,
      customization: {
        title: `SaaS Subscription: ${plan.name}`,
        description: `Subscription payment for ${plan.name}`,
      },
    };

    const chapaResponse = await initializePayment(chapaData);
    
    // Create a pending subscription
    await prisma.subscription.create({
      data: {
        owner_id: parseInt(ownerId),
        plan_id: parseInt(planId),
        payment_id: payment.payment_id,
        status: 'CANCELLED', // Use CANCELLED or a new 'PENDING' status to avoid activation before payment
        start_date: new Date(),
        end_date: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000),
      }
    });

    res.json({
      success: true,
      data: chapaResponse.data,
      txRef
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
