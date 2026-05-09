const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Pensions:', await prisma.pension.findMany());
  console.log('Rooms:', await prisma.room.findMany());
  console.log('Bookings:', await prisma.booking.findMany());
}
main().catch(console.error).finally(() => prisma.$disconnect());
