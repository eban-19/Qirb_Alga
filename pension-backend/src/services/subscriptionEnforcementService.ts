import prisma from '../lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

export interface SubscriptionStatusResult {
  hasActiveSubscription: boolean;
  isRestricted: boolean; // Hard restricted
  isSoftRestricted: boolean;
  trial: {
    isActive: boolean;
    daysLeft: number;
    expiryDate: Date | null;
  };
  gracePeriod: {
    isActive: boolean;
    daysLeft: number;
    expiryDate: Date | null;
  };
  subscription: any | null;
  plan: any | null;
  warnings: string[];
}

class SubscriptionEnforcementService {
  /**
   * Resolves the effective subscription policy for a given owner.
   * If the owner has an active plan with a custom policy, it returns that.
   * Otherwise, it returns the global default policy.
   */
  async getEffectivePolicy(ownerId: number) {
    // 1. Get owner's active subscription to find plan_id
    const activeSub = await prisma.subscription.findFirst({
      where: {
        owner_id: ownerId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { created_at: 'desc' }
    });

    // 2. If they have a plan, check if it has a specific policy
    if (activeSub) {
      const planPolicy = await prisma.subscriptionPolicy.findFirst({
        where: { plan_id: activeSub.plan_id }
      });
      if (planPolicy) return planPolicy;
    }

    // 3. Fallback to Global Default Policy (plan_id is null)
    let globalPolicy = await prisma.subscriptionPolicy.findFirst({
      where: { plan_id: null }
    });

    // 4. Create default global policy if it doesn't exist
    if (!globalPolicy) {
      globalPolicy = await prisma.subscriptionPolicy.create({
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

    return globalPolicy;
  }

  /**
   * Returns a comprehensive status object for the owner's subscription state,
   * factoring in trials, grace periods, and expiration.
   */
  async getSubscriptionStatus(ownerId: number): Promise<SubscriptionStatusResult> {
    const user = await prisma.user.findUnique({
      where: { user_id: ownerId }
    });

    if (!user) throw new Error('User not found');

    const policy = await this.getEffectivePolicy(ownerId);

    const activeSub = await prisma.subscription.findFirst({
      where: {
        owner_id: ownerId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED] }
      },
      include: { plan: true },
      orderBy: { end_date: 'desc' }
    });

    const now = new Date();
    const result: SubscriptionStatusResult = {
      hasActiveSubscription: false,
      isRestricted: false,
      isSoftRestricted: false,
      trial: { isActive: false, daysLeft: 0, expiryDate: null },
      gracePeriod: { isActive: false, daysLeft: 0, expiryDate: null },
      subscription: activeSub || null,
      plan: activeSub?.plan || null,
      warnings: []
    };

    // ── 1. Active paid subscription takes priority over everything ───────────
    if (activeSub && now < activeSub.end_date && activeSub.status === SubscriptionStatus.ACTIVE) {
      result.hasActiveSubscription = true;

      const daysUntilExpiry = Math.ceil((activeSub.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const warningDays = policy.warning_days_before as number[];
      if (warningDays && Array.isArray(warningDays) && warningDays.includes(daysUntilExpiry)) {
        result.warnings.push(`Your subscription expires in ${daysUntilExpiry} days.`);
      }
      return result;
    }

    // ── 2. Evaluate Trial ─────────────────────────────────────────────────────
    if (policy.trial_enabled && user.created_at) {
      const trialExpiry = new Date(user.created_at.getTime() + policy.trial_duration_days * 24 * 60 * 60 * 1000);
      const isTrialActive = now < trialExpiry;

      if (isTrialActive) {
        result.trial.isActive = true;
        result.trial.expiryDate = trialExpiry;
        result.trial.daysLeft = Math.max(0, Math.ceil((trialExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return result;
      }
    }

    // ── 3. Expired subscription → grace period / restrictions ─────────────────
    if (activeSub) {
      const expiryDate = activeSub.end_date;
      const gracePeriodEnd = new Date(expiryDate.getTime() + policy.grace_period_days * 24 * 60 * 60 * 1000);
      const softRestrictionStart = gracePeriodEnd; // soft restriction begins right after grace
      const hardRestrictionStart = new Date(softRestrictionStart.getTime() + policy.hard_restriction_days * 24 * 60 * 60 * 1000);

      if (now < gracePeriodEnd) {
        result.gracePeriod.isActive = true;
        result.gracePeriod.expiryDate = gracePeriodEnd;
        result.gracePeriod.daysLeft = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        result.warnings.push(`Grace period active. You have ${result.gracePeriod.daysLeft} days to renew.`);
      } else if (now >= softRestrictionStart && now < hardRestrictionStart) {
        result.isSoftRestricted = true;
        result.warnings.push(`Your account is restricted. Please renew to restore full access.`);
      } else if (now >= hardRestrictionStart) {
        result.isRestricted = true;
        result.warnings.push(`Your account has been suspended due to an expired subscription.`);
      }
    } else {
      // No subscription and trial expired/disabled
      // In development: keep the owner unblocked to avoid total lockout,
      // but do NOT fake an active trial — just skip restriction.
      if (process.env.NODE_ENV !== 'production') {
        // Dev fallback: unrestricted, but no fake trial banner
        return result;
      }
      result.isRestricted = true;
    }

    return result;
  }

  /**
   * Helper to check if a user can access a specific feature.
   */
  async checkFeatureAccess(ownerId: number, featureName: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(ownerId);

    if (status.isRestricted) return false; // Hard restriction blocks everything
    if (status.trial.isActive) return true; // Trial allows everything
    if (status.hasActiveSubscription) return true; // Active sub allows everything
    if (status.gracePeriod.isActive) return true; // Grace period allows everything (usually)

    if (status.isSoftRestricted) {
      const policy = await this.getEffectivePolicy(ownerId);
      const restrictedFeatures = policy.restricted_features as string[];
      if (restrictedFeatures && Array.isArray(restrictedFeatures)) {
        return !restrictedFeatures.includes(featureName);
      }
      return false; // Default: soft restriction blocks if feature isn't explicitly checked?
      // Actually, if it's soft restricted, maybe we just return false for "write" operations.
    }

    return false;
  }
}

export default new SubscriptionEnforcementService();
