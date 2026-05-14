
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSubscription() {
  console.log('🔄 Searching for pending subscriptions...');
  
  // Find subscriptions that are CANCELLED (placeholder for pending) for the owner
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'CANCELLED'
    },
    include: {
      owner: true,
      plan: true
    }
  });

  console.log(`Found ${subscriptions.length} subscriptions to fix.`);

  for (const sub of subscriptions) {
    console.log(`✅ Activating ${sub.plan.name} for ${sub.owner.full_name}...`);
    
    // Activate subscription
    await prisma.subscription.update({
      where: { subscription_id: sub.subscription_id },
      data: { status: 'ACTIVE' }
    });

    // Approve owner
    await prisma.user.update({
      where: { user_id: sub.owner_id },
      data: { status: 'Approved', approved: 1 }
    });

    // Mark payment as PAID if it exists
    if (sub.payment_id) {
      await prisma.payment.update({
        where: { payment_id: sub.payment_id },
        data: { status: 'PAID' }
      });
    }
  }

  console.log('✨ All done!');
  await prisma.$disconnect();
}

fixSubscription().catch(err => {
  console.error(err);
  process.exit(1);
});
