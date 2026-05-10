import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding subscription plans...');

  const plans = [
    {
      name: 'Monthly Plan',
      price: 499.99,
      duration_days: 30,
      features: JSON.stringify(['Unlimited Rooms', 'Staff Management', 'Basic Analytics']),
      is_active: true,
    },
    {
      name: 'Annual Plan',
      price: 4999.99,
      duration_days: 365,
      features: JSON.stringify(['Unlimited Rooms', 'Staff Management', 'Advanced Analytics', 'Priority Support']),
      is_active: true,
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { plan_id: plans.indexOf(plan) + 1 }, // This is a bit hacky but works for seed
      update: plan,
      create: plan,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
