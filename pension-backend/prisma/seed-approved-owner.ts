import { PrismaClient, Role, UserStatus, ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Approved Owner...');

  const ownerEmail = 'owner@test.com';
  const hashedPassword = await bcrypt.hash('owner123', 10);

  // 1. Create/Update the Owner User
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      status: UserStatus.Approved,
      approved: 1
    },
    create: {
      full_name: 'Approved Test Owner',
      email: ownerEmail,
      password_hash: hashedPassword,
      role: Role.Owner,
      status: UserStatus.Approved,
      approved: 1,
      phone: '+251911223344'
    },
  });

  console.log(`✅ Owner user created/updated: ${owner.email}`);

  // 2. Create/Update the Owner Profile
  await prisma.ownerProfile.upsert({
    where: { owner_id: owner.user_id },
    update: {
      approval_status: ApprovalStatus.Approved,
    },
    create: {
      owner_id: owner.user_id,
      business_name: 'Test Business',
      business_email: ownerEmail,
      business_phone: '+251911223344',
      license_number: 'LIC-123456',
      approval_status: ApprovalStatus.Approved,
    },
  });

  console.log(`✅ Owner profile approved for: ${owner.full_name}`);

  // 3. Create a Pension for this owner
  const pension = await prisma.pension.upsert({
    where: { pension_id: 101 }, // Use a high ID to avoid conflicts
    update: {},
    create: {
      pension_id: 101,
      owner_id: owner.user_id,
      name: 'Luxury Oasis Pension',
      phone: '+251911223344',
      email: 'contact@luxuryoasis.com',
      description: 'A beautiful and serene place to stay in the heart of the city.',
      address: 'Bole, Addis Ababa, Ethiopia',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      status: 'active', // Already approved
      capacity: 10,
    },
  });

  console.log(`✅ Pension created: ${pension.name}`);

  // 4. Create Packages for the pension
  const packages = [
    { name: 'Standard Stay', price: 450, description: 'Basic comfortable stay' },
    { name: 'Deluxe Suite', price: 850, description: 'Spacious room with better view' },
    { name: 'VIP Executive', price: 1500, description: 'All-inclusive premium experience' },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { package_id: 100 + packages.indexOf(pkg) },
      update: {},
      create: {
        package_id: 100 + packages.indexOf(pkg),
        pension_id: pension.pension_id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        is_active: true,
      },
    });
  }

  console.log('✅ Packages created.');

  // 5. Create Rooms and link to the first package
  const firstPackage = await prisma.package.findFirst({ where: { pension_id: pension.pension_id } });
  
  if (firstPackage) {
    for (let i = 1; i <= 5; i++) {
      await prisma.room.upsert({
        where: { room_id: 200 + i },
        update: {},
        create: {
          room_id: 200 + i,
          pension_id: pension.pension_id,
          room_number: `10${i}`,
          room_type: 'Double Bed',
          capacity: 2,
          package_id: firstPackage.package_id,
          availability_status: 'Available',
        },
      });
    }
  }

  console.log('✅ 5 Rooms created and linked to packages.');
  console.log('🎉 Full Seed complete! You have a ready-to-use Owner, Pension, and Rooms.');
  console.log(`   Owner Login: ${ownerEmail} / owner123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
