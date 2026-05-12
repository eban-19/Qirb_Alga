import { PrismaClient, RoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roomCounts = await prisma.room.groupBy({
    by: ['pension_id', 'availability_status'],
    _count: {
      room_id: true
    }
  });
  console.log(JSON.stringify(roomCounts, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
