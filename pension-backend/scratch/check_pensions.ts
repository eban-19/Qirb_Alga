import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pensions = await prisma.pension.findMany({
    select: {
      pension_id: true,
      name: true,
      status: true,
      owner: {
        select: {
          ownerProfile: {
            select: {
              approval_status: true
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(pensions, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
