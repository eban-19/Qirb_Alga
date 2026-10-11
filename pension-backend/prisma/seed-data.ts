import { PrismaClient, Role, UserStatus, ApprovalStatus, RoomStatus, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Unsplash high quality room & hotel images
const packageImageSets = [
  {
    primary: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    primary: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    primary: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    primary: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    primary: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

const pensionCoverImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1000&q=80'
];

// Owners configuration with 5 items
const ownersData = [
  {
    email: 'owner1@test.com',
    fullName: 'Abreham Bekele',
    phone: '+251911100001',
    businessName: 'Bole Luxury Stays',
    pensionName: 'Bole Grand Pension & Suites',
    city: 'Addis Ababa',
    subCity: 'Bole',
    address: 'Bole Road, Near Friendship City Center, Addis Ababa',
    region: 'Addis Ababa',
    lat: 8.995,
    lng: 38.788,
    description: 'Experience premium luxury and comfort in the heart of Bole. Close to Bole International Airport.',
  },
  {
    email: 'owner2@test.com',
    fullName: 'Meron Tadesse',
    phone: '+251911100002',
    businessName: 'Bishoftu Lake Resorts',
    pensionName: 'Kuriftu Lakeside Pension',
    city: 'Bishoftu',
    subCity: 'Hora',
    address: 'Lake Hora Shore Road, Bishoftu',
    region: 'Oromia',
    lat: 8.752,
    lng: 38.983,
    description: 'A serene getaway offering breathtaking lakeside views, tranquility, and relaxing amenities.',
  },
  {
    email: 'owner3@test.com',
    fullName: 'Solomon Haile',
    phone: '+251911100003',
    businessName: 'Nile Paradise Hospitality',
    pensionName: 'Blue Nile View Pension',
    city: 'Bahir Dar',
    subCity: 'Kebele 04',
    address: 'Lake Tana Shore Boulevard, Bahir Dar',
    region: 'Amhara',
    lat: 11.593,
    lng: 37.390,
    description: 'Modern waterfront pension situated right beside Lake Tana and the historic Blue Nile outlets.',
  },
  {
    email: 'owner4@test.com',
    fullName: 'Tigist Alemu',
    phone: '+251911100004',
    businessName: 'Hawassa Rift Valley Lodges',
    pensionName: 'Hawassa Sunset Pension',
    city: 'Hawassa',
    subCity: 'Tabor',
    address: 'Lake Hawassa Park Area, Hawassa',
    region: 'Sidama',
    lat: 7.062,
    lng: 38.476,
    description: 'Enjoy stunning sunsets over Lake Hawassa with premium room facilities and exceptional local hospitality.',
  },
  {
    email: 'owner5@test.com',
    fullName: 'Dawit Kebede',
    phone: '+251911100005',
    businessName: 'Royal Gondar Heritage',
    pensionName: 'Fasilides Royal Castle Pension',
    city: 'Gondar',
    subCity: 'Piazza',
    address: 'Historic Piazza District, Near Fasil Ghebbi, Gondar',
    region: 'Amhara',
    lat: 12.607,
    lng: 37.464,
    description: 'Charming historic pension surrounded by ancient royal castles, offering top-tier cozy suites.',
  }
];

const packageTemplates = [
  {
    name: 'Standard Single Package',
    description: 'Cozy single room package perfect for solo travelers and business trips.',
    price: 3200,
    type: 'Standard Single Bed',
    beds: 1,
    capacity: 1,
    inclusions: ['Free Wi-Fi', 'Breakfast Included', 'Daily Housekeeping', 'Hot Shower'],
    isPopular: false
  },
  {
    name: 'Deluxe Double Package',
    description: 'Spacious double bed room equipped with modern amenities and city/nature view.',
    price: 1100,
    type: 'Deluxe Double Bed',
    beds: 2,
    capacity: 2,
    inclusions: ['Free Wi-Fi', 'Buffet Breakfast', 'Smart TV', 'Air Conditioning', 'Room Service'],
    isPopular: true
  },
  {
    name: 'Family Comfort Package',
    description: 'Expansive multi-bed package designed for families and groups.',
    price: 1800,
    type: 'Family Suite',
    beds: 3,
    capacity: 4,
    inclusions: ['Free Wi-Fi', 'Breakfast for 4', 'Mini Fridge', 'Kitchenette Access', 'Free Parking'],
    isPopular: false
  },
  {
    name: 'VIP Executive Suite Package',
    description: 'Luxury suite featuring a king-size bed, private balcony, and dedicated lounge.',
    price: 2800,
    type: 'Executive VIP Suite',
    beds: 1,
    capacity: 2,
    inclusions: ['Free Wi-Fi', 'All-Inclusive Breakfast & Lunch', 'Jacuzzi Access', 'Airport Shuttle', '24/7 Butler Service'],
    isPopular: true
  },
  {
    name: 'Honeymoon Special Package',
    description: 'Romantic romantic suite package complete with complimentary wine, floral decor, and lake/city views.',
    price: 3800,
    type: 'Honeymoon Suite',
    beds: 1,
    capacity: 2,
    inclusions: ['Free Wi-Fi', 'Champagne & Fruit Basket', 'Private Balcony', 'Spa & Sauna Discount', 'Late Check-out'],
    isPopular: false
  }
];

async function main() {
  console.log('🌱 Starting full data seed for 5 Owners, 25 Packages (5 each), and 250 Rooms (10 per package)...');

  const hashedPassword = await bcrypt.hash('owner123', 10);

  // Ensure an active subscription plan exists
  let plan = await prisma.subscriptionPlan.findFirst({ where: { is_active: true } });
  if (!plan) {
    plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Enterprise Owner Plan',
        price: 4999.99,
        duration_days: 365,
        features: JSON.stringify(['Unlimited Rooms', 'Package Management', 'Staff Management', 'Analytics']),
        is_active: true,
      }
    });
  }

  let totalOwnersCreated = 0;
  let totalPackagesCreated = 0;
  let totalRoomsCreated = 0;

  for (let ownerIdx = 0; ownerIdx < ownersData.length; ownerIdx++) {
    const data = ownersData[ownerIdx];
    const pensionCover = pensionCoverImages[ownerIdx % pensionCoverImages.length];

    // 1. Create/Update User (Owner)
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        full_name: data.fullName,
        password_hash: hashedPassword,
        role: Role.Owner,
        status: UserStatus.Approved,
        approved: 1,
        phone: data.phone,
      },
      create: {
        full_name: data.fullName,
        email: data.email,
        password_hash: hashedPassword,
        role: Role.Owner,
        status: UserStatus.Approved,
        approved: 1,
        phone: data.phone,
      },
    });

    // 2. Create/Update OwnerProfile
    await prisma.ownerProfile.upsert({
      where: { owner_id: user.user_id },
      update: {
        business_name: data.businessName,
        business_email: data.email,
        business_phone: data.phone,
        approval_status: ApprovalStatus.Approved,
      },
      create: {
        owner_id: user.user_id,
        business_name: data.businessName,
        business_email: data.email,
        business_phone: data.phone,
        license_number: `LIC-${100000 + ownerIdx}`,
        approval_status: ApprovalStatus.Approved,
      },
    });

    // 3. Ensure Owner Subscription is active
    const activeSub = await prisma.subscription.findFirst({
      where: { owner_id: user.user_id, status: SubscriptionStatus.ACTIVE }
    });

    if (!activeSub) {
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 365);
      await prisma.subscription.create({
        data: {
          owner_id: user.user_id,
          plan_id: plan.plan_id,
          start_date: now,
          end_date: future,
          status: SubscriptionStatus.ACTIVE,
          is_free: false,
        }
      });
    }

    // 4. Create/Update Pension
    // Find or create pension for this owner
    let pension = await prisma.pension.findFirst({
      where: { owner_id: user.user_id }
    });

    if (!pension) {
      pension = await prisma.pension.create({
        data: {
          owner_id: user.user_id,
          name: data.pensionName,
          phone: data.phone,
          email: data.email,
          description: data.description,
          owner_info: `Managed by ${data.fullName}`,
          room_details: '50 Luxury Rooms across 5 Custom Packages',
          city: data.city,
          sub_city: data.subCity,
          address: data.address,
          region: data.region,
          country: 'Ethiopia',
          latitude: data.lat,
          longitude: data.lng,
          capacity: 50,
          image_url: pensionCover,
          status: 'active',
          package_images: packageImageSets.map(p => p.primary)
        }
      });
    } else {
      pension = await prisma.pension.update({
        where: { pension_id: pension.pension_id },
        data: {
          name: data.pensionName,
          phone: data.phone,
          email: data.email,
          description: data.description,
          city: data.city,
          sub_city: data.subCity,
          address: data.address,
          region: data.region,
          latitude: data.lat,
          longitude: data.lng,
          capacity: 50,
          image_url: pensionCover,
          status: 'active',
          package_images: packageImageSets.map(p => p.primary)
        }
      });
    }

    totalOwnersCreated++;
    console.log(`\n🏢 Owner #${totalOwnersCreated} (${data.fullName}) -> Pension: "${pension.name}" (${pension.city})`);

    // 5. Create 5 Packages for this Pension
    for (let pkgIdx = 0; pkgIdx < packageTemplates.length; pkgIdx++) {
      const tmpl = packageTemplates[pkgIdx];
      const imgSet = packageImageSets[pkgIdx % packageImageSets.length];

      // Find existing package or create new one
      let pkg = await prisma.package.findFirst({
        where: { pension_id: pension.pension_id, name: tmpl.name }
      });

      if (!pkg) {
        pkg = await prisma.package.create({
          data: {
            pension_id: pension.pension_id,
            name: tmpl.name,
            description: tmpl.description,
            price: tmpl.price,
            duration_days: 1,
            inclusions: tmpl.inclusions,
            is_active: true,
            is_most_popular: tmpl.isPopular,
            image_url: imgSet.primary,
            images: imgSet.gallery,
          }
        });
      } else {
        pkg = await prisma.package.update({
          where: { package_id: pkg.package_id },
          data: {
            description: tmpl.description,
            price: tmpl.price,
            inclusions: tmpl.inclusions,
            is_active: true,
            is_most_popular: tmpl.isPopular,
            image_url: imgSet.primary,
            images: imgSet.gallery,
          }
        });
      }

      totalPackagesCreated++;

      // 6. Create 10 Rooms for this Package
      let packageRoomsCreated = 0;

      for (let roomIdx = 1; roomIdx <= 10; roomIdx++) {
        const roomNum = `${(pkgIdx + 1) * 100 + roomIdx}`; // e.g. 101-110, 201-210, etc.

        // Check if room exists
        const existingRoom = await prisma.room.findFirst({
          where: { pension_id: pension.pension_id, room_number: roomNum }
        });

        // Alternate status: room 1-8 available, room 9 occupied, room 10 available
        const availability = (roomIdx === 9) ? RoomStatus.Occupied : RoomStatus.Available;

        if (!existingRoom) {
          await prisma.room.create({
            data: {
              pension_id: pension.pension_id,
              owner_id: user.user_id,
              package_id: pkg.package_id,
              room_number: roomNum,
              room_type: tmpl.type,
              number_of_beds: tmpl.beds,
              capacity: tmpl.capacity,
              price_per_night: tmpl.price,
              availability_status: availability,
            }
          });
        } else {
          await prisma.room.update({
            where: { room_id: existingRoom.room_id },
            data: {
              owner_id: user.user_id,
              package_id: pkg.package_id,
              room_type: tmpl.type,
              number_of_beds: tmpl.beds,
              capacity: tmpl.capacity,
              price_per_night: tmpl.price,
              availability_status: availability,
            }
          });
        }

        packageRoomsCreated++;
        totalRoomsCreated++;
      }

      console.log(`   📦 Package #${pkgIdx + 1}: "${pkg.name}" ($${pkg.price}/night) -> 🖼️ Image Attached -> 🛏️ ${packageRoomsCreated} Rooms Created`);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 SEEDING COMPLETE SUCCESSFULLY!');
  console.log(`✅ Owners/Pensions Created: ${totalOwnersCreated}`);
  console.log(`✅ Total Packages Created:  ${totalPackagesCreated} (5 per owner)`);
  console.log(`✅ Total Rooms Created:     ${totalRoomsCreated} (10 per package)`);
  console.log('==================================================\n');
  console.log('🔑 OWNER LOGINS (Password for all: owner123):');
  ownersData.forEach(o => {
    console.log(`   - ${o.fullName}: ${o.email} (${o.pensionName}, ${o.city})`);
  });
  console.log('==================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
