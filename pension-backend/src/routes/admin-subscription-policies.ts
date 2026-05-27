import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get global subscription policy
router.get('/global', async (req, res) => {
  try {
    let policy = await prisma.subscriptionPolicy.findFirst({
      where: { plan_id: null }
    });

    if (!policy) {
      policy = await prisma.subscriptionPolicy.create({
        data: {
          plan_id: null,
          trial_enabled: true,
          trial_duration_days: 14,
          grace_period_days: 0,
          warning_days_before: [7, 3, 1],
          soft_restriction_days: 0,
          hard_restriction_days: 7,
          data_retention_days: 90
        }
      });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Failed to get global policy:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update global subscription policy
router.put('/global', async (req: any, res: any) => {
  try {
    const {
      trial_enabled,
      trial_duration_days,
      grace_period_days,
      warning_days_before,
      soft_restriction_days,
      hard_restriction_days,
      data_retention_days,
      restricted_features
    } = req.body;

    let policy = await prisma.subscriptionPolicy.findFirst({
      where: { plan_id: null }
    });

    if (policy) {
      policy = await prisma.subscriptionPolicy.update({
        where: { id: policy.id },
        data: {
          trial_enabled,
          trial_duration_days: parseInt(trial_duration_days),
          grace_period_days: parseInt(grace_period_days),
          warning_days_before: typeof warning_days_before === 'string' ? JSON.parse(warning_days_before) : warning_days_before,
          soft_restriction_days: parseInt(soft_restriction_days),
          hard_restriction_days: parseInt(hard_restriction_days),
          data_retention_days: parseInt(data_retention_days),
          restricted_features: typeof restricted_features === 'string' ? JSON.parse(restricted_features) : restricted_features
        }
      });
    } else {
      policy = await prisma.subscriptionPolicy.create({
        data: {
          plan_id: null,
          trial_enabled,
          trial_duration_days: parseInt(trial_duration_days),
          grace_period_days: parseInt(grace_period_days),
          warning_days_before: typeof warning_days_before === 'string' ? JSON.parse(warning_days_before) : warning_days_before,
          soft_restriction_days: parseInt(soft_restriction_days),
          hard_restriction_days: parseInt(hard_restriction_days),
          data_retention_days: parseInt(data_retention_days),
          restricted_features: typeof restricted_features === 'string' ? JSON.parse(restricted_features) : restricted_features
        }
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'UPDATE_GLOBAL_SUBSCRIPTION_POLICY',
        entity_type: 'SUBSCRIPTION_POLICY',
        entity_id: policy.id,
        details: 'Updated global subscription enforcement policy'
      }
    });

    res.json({ success: true, data: policy, message: 'Global policy updated successfully' });
  } catch (error) {
    console.error('Failed to update global policy:', error);
    res.status(500).json({ success: false, message: 'Server error updating policy' });
  }
});

// Note: Future routes can be added here for per-plan policies (GET /plan/:planId, PUT /plan/:planId)

export default router;
