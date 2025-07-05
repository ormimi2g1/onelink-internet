import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const saltRounds = 12;

  // Admin user
  const adminPassword = await bcrypt.hash('admin123456', saltRounds);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@onelink.com' },
    update: {},
    create: {
      email: 'admin@onelink.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+2348012345678',
      role: 'ADMIN',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // Test customer user
  const customerPassword = await bcrypt.hash('customer123456', saltRounds);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      passwordHash: customerPassword,
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+2348087654321',
      role: 'CUSTOMER',
      isEmailVerified: true,
      isPhoneVerified: false,
    },
  });

  // Another customer user
  const customer2Password = await bcrypt.hash('user123456', saltRounds);
  const customer2User = await prisma.user.upsert({
    where: { email: 'user@onelink.com' },
    update: {},
    create: {
      email: 'user@onelink.com',
      passwordHash: customer2Password,
      firstName: 'Regular',
      lastName: 'User',
      phone: '+2348098765432',
      role: 'CUSTOMER',
      isEmailVerified: false,
      isPhoneVerified: false,
    },
  });

  console.log('✅ Created test users:');
  console.log('📧 Admin:', adminUser.email);
  console.log('📧 Customer 1:', customerUser.email);
  console.log('📧 Customer 2:', customer2User.email);

  // Create some test service plans
  const basicPlan = await prisma.servicePlan.upsert({
    where: { id: 'basic-plan' },
    update: {},
    create: {
      id: 'basic-plan',
      name: 'Basic Internet',
      region: 'Lagos',
      speed: '10 Mbps',
      price: 500000, // 5000 NGN in kobo
      type: 'RESIDENTIAL',
      features: ['10 Mbps download', '2 Mbps upload', 'Unlimited data'],
      description: 'Perfect for basic browsing and social media',
      isActive: true,
    },
  });

  const premiumPlan = await prisma.servicePlan.upsert({
    where: { id: 'premium-plan' },
    update: {},
    create: {
      id: 'premium-plan',
      name: 'Premium Internet',
      region: 'Lagos',
      speed: '50 Mbps',
      price: 1500000, // 15000 NGN in kobo
      type: 'SME',
      features: ['50 Mbps download', '10 Mbps upload', 'Unlimited data', 'Priority support'],
      description: 'Great for streaming and remote work',
      isActive: true,
    },
  });

  const businessPlan = await prisma.servicePlan.upsert({
    where: { id: 'business-plan' },
    update: {},
    create: {
      id: 'business-plan',
      name: 'Business Internet',
      region: 'Lagos',
      speed: '100 Mbps',
      price: 3000000, // 30000 NGN in kobo
      type: 'ENTERPRISE',
      features: ['100 Mbps download', '20 Mbps upload', 'Unlimited data', 'Priority support', 'Static IP'],
      description: 'Enterprise-grade connectivity for businesses',
      isActive: true,
    },
  });

  console.log('✅ Created test service plans:');
  console.log('📦 Basic Plan:', basicPlan.name);
  console.log('📦 Premium Plan:', premiumPlan.name);
  console.log('📦 Business Plan:', businessPlan.name);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
