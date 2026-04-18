import bookingService from './bookingService';

class ScheduledCheckoutWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private readonly CHECK_INTERVAL_MINUTES = 5; // Check every 5 minutes

  /**
   * Start the scheduled checkout worker
   * This runs periodically to automatically complete overdue checkouts
   */
  start() {
    if (this.intervalId) {
      console.log('⚠️  Scheduled checkout worker is already running');
      return;
    }

    console.log('🚀 Starting scheduled checkout worker...');
    console.log(`⏰  Will check for overdue checkouts every ${this.CHECK_INTERVAL_MINUTES} minutes`);

    // Run immediately on startup
    this.runWorker();

    // Schedule periodic runs
    this.intervalId = setInterval(() => {
      this.runWorker();
    }, this.CHECK_INTERVAL_MINUTES * 60 * 1000);
  }

  /**
   * Stop the scheduled checkout worker
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Scheduled checkout worker stopped');
    }
  }

  /**
   * Run the worker logic
   * This is called periodically to process overdue checkouts
   */
  private async runWorker() {
    if (this.isRunning) {
      console.log('⏳  Scheduled checkout worker is already running, skipping this cycle');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔍 Scheduled checkout worker: Checking for overdue checkouts...');
      console.log(`📅 Current time: ${new Date().toISOString()}`);

      // Get overdue bookings
      const result = await bookingService.getOverdueCheckouts();

      if (!result.success) {
        console.error('❌ Failed to fetch overdue checkouts:', result.message);
        return;
      }

      const overdueBookings = result.data || [];
      const count = result.count;

      if (count === 0) {
        console.log('✅ No overdue checkouts found');
        return;
      }

      console.log(`📊 Found ${count} overdue checkout(s) to process`);

      // Process each overdue booking
      let processed = 0;
      let skipped = 0;
      let failed = 0;

      for (const booking of overdueBookings) {
        try {
          console.log(`\n🔄 Processing overdue checkout for booking #${booking.booking_id}`);
          console.log(`   Pension: ${booking.pension_name}`);
          console.log(`   Room: ${booking.room_id}`);
          console.log(`   Check-out date: ${booking.check_out_date}`);
          console.log(`   Current status: ${booking.status}`);

          const checkoutResult = await bookingService.completeBookingCheckout(booking.booking_id, true);

          if (checkoutResult.success) {
            if (checkoutResult.skipped) {
              console.log(`⏭️  Skipped booking #${booking.booking_id}: ${checkoutResult.message}`);
              skipped++;
            } else {
              console.log(`✅ Automatically completed booking #${booking.booking_id}`);
              processed++;
            }
          } else {
            console.log(`❌ Failed to complete booking #${booking.booking_id}: ${checkoutResult.message}`);
            failed++;
          }
        } catch (error: any) {
          console.error(`❌ Error processing booking #${booking.booking_id}:`, error);
          failed++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`\n📋 Scheduled checkout worker cycle completed in ${duration}ms`);
      console.log(`   Processed: ${processed}`);
      console.log(`   Skipped: ${skipped}`);
      console.log(`   Failed: ${failed}`);

    } catch (error: any) {
      console.error('❌ Scheduled checkout worker error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.intervalId !== null,
      checkIntervalMinutes: this.CHECK_INTERVAL_MINUTES
    };
  }
}

export default new ScheduledCheckoutWorker();
