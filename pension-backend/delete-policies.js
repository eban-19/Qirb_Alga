const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pricingPolicy.deleteMany({ where: { adjustment_value: null } })
  .then(res => console.log('Deleted', res.count))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
