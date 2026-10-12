import express from 'express';
import { PrismaClient } from '@prisma/client';
import { initializePayment, verifyPayment } from '../services/chapaService';
import { SMSService } from '../services/sms.service';

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
    const subscriptionEnforcementService = require('../services/subscriptionEnforcementService').default;
    const status = await subscriptionEnforcementService.getSubscriptionStatus(parseInt(ownerId));

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    res.status(500).json({ success: false, message: 'Failed to check status' });
  }
});

// Initialize Subscription Payment
router.post('/initialize', async (req, res) => {
  const { ownerId, userId, user_id, planId, email, firstName, lastName } = req.body;

  try {
    const rawOwnerId = ownerId || userId || user_id;
    const parsedOwnerId = parseInt(rawOwnerId);

    if (!parsedOwnerId || isNaN(parsedOwnerId)) {
      return res.status(400).json({ success: false, message: 'Valid owner ID is required' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { plan_id: parseInt(planId) } });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Verify owner exists in DB
    const owner = await prisma.user.findUnique({
      where: { user_id: parsedOwnerId }
    });

    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner account not found' });
    }

    const txRef = `SUB-${parsedOwnerId}-${planId}-${Date.now()}`;

    const payment = await prisma.payment.create({
      data: {
        reference: txRef,
        amount: plan.price,
        currency: 'ETB',
        status: 'PENDING',
        type: 'SUBSCRIPTION',
        user_id: parsedOwnerId,
      },
    });

    // Sanitize email for Chapa (Chapa requires a valid DNS-resolvable email domain like gmail.com)
    let rawEmail = (email || owner.email || 'owner@gmail.com').trim().toLowerCase();
    let [localPart, domainPart] = rawEmail.split('@');
    localPart = (localPart || `owner_${parsedOwnerId}`).replace(/[^a-z0-9._-]/g, '') || `owner_${parsedOwnerId}`;

    const trustedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    let cleanEmail = trustedDomains.includes(domainPart)
      ? `${localPart}@${domainPart}`
      : `${localPart}@gmail.com`;

    const nameParts = (owner.full_name || `${firstName || 'Owner'} ${lastName || 'User'}`).trim().split(/\s+/);
    const cleanFirstName = (firstName || nameParts[0] || 'Owner').trim().replace(/[^a-zA-Z]/g, '') || 'Owner';
    const cleanLastName = (lastName || nameParts.slice(1).join(' ') || 'User').trim().replace(/[^a-zA-Z]/g, '') || 'User';

    const chapaData = {
      amount: parseFloat(String(plan.price)).toFixed(2),
      currency: 'ETB',
      email: cleanEmail,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      tx_ref: txRef,
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:3006'}/api/payments/webhook`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/owner/subscription/verify?ref=${txRef}`,
      customization: {
        title: `Sub ${plan.name}`.substring(0, 16),
        description: `Subscription payment for ${plan.name}`,
      },
    };

    console.log('🚀 Initializing Chapa Subscription Payment:', {
      tx_ref: chapaData.tx_ref,
      amount: chapaData.amount,
      email: chapaData.email,
      name: `${chapaData.first_name} ${chapaData.last_name}`,
    });

    const chapaResponse = await initializePayment(chapaData);
    const checkoutUrl = chapaResponse.data?.checkout_url;

    if (!checkoutUrl) {
      throw new Error(chapaResponse.message || 'Chapa did not return a checkout URL');
    }

    // Create pending subscription record
    await prisma.subscription.create({
      data: {
        owner_id: parsedOwnerId,
        plan_id: parseInt(planId),
        payment_id: payment.payment_id,
        status: 'CANCELLED', // Stays cancelled until payment verification activates it
        start_date: new Date(),
        end_date: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000),
      }
    });

    res.json({
      success: true,
      data: { checkout_url: checkoutUrl },
      txRef
    });
  } catch (error: any) {
    console.error('❌ Subscription Initialize Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize subscription payment' });
  }
});

// Verify Subscription Payment
router.get('/verify/:txRef', async (req, res) => {
  const { txRef } = req.params;

  try {
    let isVerified = false;
    try {
      const verification = await verifyPayment(txRef);
      if (verification.status === 'success' && verification.data?.status === 'success') {
        isVerified = true;
      }
    } catch (verifyError: any) {
      console.warn('⚠️ Chapa verify warning:', verifyError.message);
      // In development, allow simulated transactions to pass verification
      if (process.env.NODE_ENV !== 'production' && txRef.startsWith('SUB-')) {
        console.log('🧪 Dev mode: Auto-approving test subscription transaction', txRef);
        isVerified = true;
      } else {
        throw verifyError;
      }
    }

    if (isVerified) {
      // 1. Update payment status
      const payment = await prisma.payment.update({
        where: { reference: txRef },
        data: { status: 'PAID' },
      });

      // 2. Find and activate the pending subscription
      const subscription = await prisma.subscription.findFirst({
        where: { payment_id: payment.payment_id },
        include: { plan: true, owner: true }
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { subscription_id: subscription.subscription_id },
          data: { status: 'ACTIVE' }
        });

        // 3. Ensure owner is approved/active
        await prisma.user.update({
          where: { user_id: subscription.owner_id },
          data: { status: 'Approved', approved: 1 }
        });

        // 4. Send Confirmation SMS
        if (subscription.owner?.phone) {
          try {
            const message = `Upgrade Successful! Your ${subscription.plan.name} is now active. Thank you for choosing Qirb Alga.`;
            await SMSService.sendSMS(subscription.owner.phone, message);
          } catch (smsError) {
            console.error('⚠️ Failed to send subscription SMS:', smsError);
          }
        }
      }

      return res.json({
        success: true,
        message: 'Subscription activated successfully',
        data: {
          plan: subscription?.plan?.name,
          owner: subscription?.owner?.full_name,
          expiry: subscription?.end_date
        }
      });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error: any) {
    console.error('Subscription Verify Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify subscription' });
  }
});

export default router;
