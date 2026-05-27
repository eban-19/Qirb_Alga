
import prisma from '../lib/prisma';
import notificationService from './notificationService';

class SubscriptionWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private readonly CHECK_INTERVAL_HOURS = 12; // Check every 12 hours

  /**
   * Start the subscription worker
   */
  start() {
    if (this.intervalId) {
      console.log('⚠️  Subscription worker is already running');
      return;
    }

    console.log('🚀 Starting subscription worker...');
    
    // Run immediately on startup
    this.runWorker();

    // Schedule periodic runs
    this.intervalId = setInterval(() => {
      this.runWorker();
    }, this.CHECK_INTERVAL_HOURS * 60 * 60 * 1000);
  }

  /**
   * Stop the subscription worker
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Subscription worker stopped');
    }
  }

  /**
   * Run the worker logic
   */
  private async runWorker() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      console.log('🔍 Subscription worker: Processing expirations and alerts...');
      const now = new Date();

      // 1. Process active subscriptions and check for expiration/warnings
      const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { owner: true, plan: true }
      });

      for (const sub of activeSubscriptions) {
        // We use require syntax to avoid circular dependencies if any
        const subscriptionEnforcementService = require('./subscriptionEnforcementService').default;
        const policy = await subscriptionEnforcementService.getEffectivePolicy(sub.owner_id);
        
        // Check if expired
        if (now >= sub.end_date) {
          console.log(`[WORKER] Subscription ${sub.subscription_id} expired. Updating status.`);
          await prisma.subscription.update({
            where: { subscription_id: sub.subscription_id },
            data: { status: 'EXPIRED' }
          });

          await notificationService.createNotification({
            user_id: sub.owner_id,
            title: "Subscription Expired",
            message: `Your subscription has expired. Access is restricted according to your grace period.`,
            type: "system"
          });

          // Send expiration notice
          if (sub.owner.phone) {
             const msg = `Qirb-Alga: Your subscription to ${sub.plan.name} has expired. Please renew to avoid service interruptions.`;
             await notificationService.sendSmsNotification(sub.owner_id, msg).catch(console.error);
          }
          continue;
        }

        // Check warnings
        const daysUntilExpiry = Math.ceil((sub.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const warningDays = policy.warning_days_before as number[];
        
        if (warningDays && Array.isArray(warningDays) && warningDays.includes(daysUntilExpiry)) {
           console.log(`[WORKER] Sending warning to owner ${sub.owner_id} (${daysUntilExpiry} days left)`);
           
           await notificationService.createNotification({
            user_id: sub.owner_id,
            title: "Subscription Expiring Soon",
            message: `Your subscription expires in ${daysUntilExpiry} days on ${sub.end_date.toLocaleDateString()}.`,
            type: "system"
           });

           if (sub.owner.phone) {
             const msg = `Qirb-Alga Reminder: Your subscription expires in ${daysUntilExpiry} days. Please renew soon.`;
             await notificationService.sendSmsNotification(sub.owner_id, msg).catch(console.error);
           }
        }
      }

      // 2. Process Trial Expirations
      const trialPolicy = await prisma.subscriptionPolicy.findFirst({ where: { plan_id: null } });
      if (trialPolicy && trialPolicy.trial_enabled) {
        const users = await prisma.user.findMany({
          where: { role: 'Owner' }
        });

        for (const user of users) {
           const trialDays = trialPolicy.trial_duration_days;
           if (user.created_at) {
             const trialExpiry = new Date(user.created_at.getTime() + trialDays * 24 * 60 * 60 * 1000);
             const daysUntilExpiry = Math.ceil((trialExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
             
             if (daysUntilExpiry === 1 && user.phone) {
                const msg = `Qirb-Alga: Your free trial expires tomorrow. Please subscribe to keep your property active.`;
                await notificationService.sendSmsNotification(user.user_id, msg).catch(console.error);
             }
           }
        }
      }

    } catch (error) {
      console.error('❌ Subscription worker error:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

export default new SubscriptionWorker();
