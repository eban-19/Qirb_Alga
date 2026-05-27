import { PrismaClient, PolicyCategory, AdjustmentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting pricing policy migration...');
  
  // 1. Migrate package discounts to LONG_STAY policies
  const packages = await prisma.package.findMany({
    where: {
      discount_percentage: { gt: 0 }
    }
  });
  
  console.log(`Found ${packages.length} packages with discounts.`);
  
  let migratedCount = 0;
  
  for (const pkg of packages) {
    if (!pkg.discount_percentage) continue;
    
    // Check if policy already exists
    const existing = await prisma.pricingPolicy.findFirst({
      where: {
        package_id: pkg.package_id,
        category: PolicyCategory.LONG_STAY
      }
    });
    
    if (existing) {
      console.log(`Policy already exists for package ${pkg.package_id}`);
      continue;
    }
    
    await prisma.pricingPolicy.create({
      data: {
        pension_id: pkg.pension_id,
        package_id: pkg.package_id,
        name: `${pkg.discount_min_days || 7}+ Days Discount`,
        category: PolicyCategory.LONG_STAY,
        description: `Migrated from package discount. Applies when booking ${pkg.discount_min_days || 7} or more nights.`,
        rules: { triggerNights: pkg.discount_min_days || 7 },
        min_nights: pkg.discount_min_days || 7,
        adjustment_type: AdjustmentType.PERCENTAGE,
        adjustment_value: -Math.abs(pkg.discount_percentage), // negative for discount
        is_active: true,
        priority: 1
      }
    });
    
    migratedCount++;
  }
  
  console.log(`Migration complete. Created ${migratedCount} pricing policies.`);
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
