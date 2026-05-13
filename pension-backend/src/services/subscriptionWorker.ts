
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

      // 1. Mark expired subscriptions
      const expiredResult = await prisma.subscription.updateMany({
        where: {
          status: 'ACTIVE',
          end_date: { lt: now }
        },
        data: {
          status: 'EXPIRED'
        }
      });
      if (expiredResult.count > 0) {
        console.log(`✅ Marked ${expiredResult.count} subscriptions as EXPIRED`);
      }

      // 2. Alert for subscriptions expiring in 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);
      
      const expiringSoon3 = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          end_date: {
            gt: now,
            lte: threeDaysFromNow
          }
        },
        include: { owner: true }
      });

      for (const sub of expiringSoon3) {
        await notificationService.createNotification({
          user_id: sub.owner_id,
          title: "Subscription Expiring Soon",
          message: `Your subscription will expire in 3 days on ${sub.end_date.toLocaleDateString()}. Please renew to avoid service interruption.`,
          type: "system"
        });
        
        await notificationService.sendSmsNotification(
          sub.owner_id,
          `Qirb-Alga Alert: Your subscription expires in 3 days. Renew now to keep your pension visible to guests.`
        );
      }

      // 3. Alert for subscriptions expiring in 1 day
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(now.getDate() + 1);
      
      const expiringSoon1 = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          end_date: {
            gt: now,
            lte: oneDayFromNow
          }
        },
        include: { owner: true }
      });

      for (const sub of expiringSoon1) {
        await notificationService.sendSmsNotification(
          sub.owner_id,
          `CRITICAL: Your Qirb-Alga subscription expires TOMORROW. Service will be restricted if not renewed.`
        );
      }

    } catch (error) {
      console.error('❌ Subscription worker error:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

export default new SubscriptionWorker();
