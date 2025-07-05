import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create service plans first
  console.log('📊 Creating service plans...');
  
  const regions = ['Lagos', 'Abuja', 'Port Harcourt', 'Ilorin'];
  const planConfigs = {
    Lagos: [
      { name: 'Basic Home', speed: '10 Mbps', price: 1500000, type: 'RESIDENTIAL' }, // 15,000 NGN in kobo
      { name: 'Standard Home', speed: '25 Mbps', price: 2500000, type: 'RESIDENTIAL' },
      { name: 'Premium Home', speed: '50 Mbps', price: 4000000, type: 'RESIDENTIAL' },
      { name: 'Business Plus', speed: '100 Mbps', price: 8000000, type: 'SME' },
      { name: 'Enterprise Pro', speed: '200 Mbps', price: 15000000, type: 'ENTERPRISE' }
    ],
    Abuja: [
      { name: 'Basic Home', speed: '20 Mbps', price: 2000000, type: 'RESIDENTIAL' },
      { name: 'Standard Home', speed: '30 Mbps', price: 3000000, type: 'RESIDENTIAL' },
      { name: 'Premium Home', speed: '75 Mbps', price: 4500000, type: 'RESIDENTIAL' },
      { name: 'Business Plus', speed: '120 Mbps', price: 10000000, type: 'SME' },
      { name: 'Enterprise Pro', speed: '250 Mbps', price: 18000000, type: 'ENTERPRISE' }
    ],
    'Port Harcourt': [
      { name: 'Basic Home', speed: '15 Mbps', price: 1800000, type: 'RESIDENTIAL' },
      { name: 'Standard Home', speed: '30 Mbps', price: 3000000, type: 'RESIDENTIAL' },
      { name: 'Premium Home', speed: '60 Mbps', price: 4200000, type: 'RESIDENTIAL' },
      { name: 'Business Plus', speed: '120 Mbps', price: 9500000, type: 'SME' },
      { name: 'Enterprise Pro', speed: '200 Mbps', price: 16000000, type: 'ENTERPRISE' }
    ],
    Ilorin: [
      { name: 'Basic Home', speed: '10 Mbps', price: 1200000, type: 'RESIDENTIAL' },
      { name: 'Standard Home', speed: '25 Mbps', price: 2200000, type: 'RESIDENTIAL' },
      { name: 'Premium Home', speed: '40 Mbps', price: 3500000, type: 'RESIDENTIAL' },
      { name: 'Business Plus', speed: '100 Mbps', price: 7500000, type: 'SME' }
    ]
  };

  const createdPlans = [];
  
  for (const region of regions) {
    const configs = planConfigs[region as keyof typeof planConfigs];
    for (const config of configs) {
      const plan = await prisma.servicePlan.create({
        data: {
          name: config.name,
          region,
          speed: config.speed,
          price: config.price,
          type: config.type as 'RESIDENTIAL' | 'SME' | 'ENTERPRISE',
          features: [
            'Unlimited data',
            '24/7 customer support',
            'Free installation',
            'No data caps',
            'High-speed internet'
          ],
          description: `${config.name} plan with ${config.speed} speed for ${region} region`,
        },
      });
      createdPlans.push(plan);
    }
  }

  console.log(`✅ Created ${createdPlans.length} service plans`);

  // Create test users
  console.log('👥 Creating test users...');
  
  const saltRounds = 12;
  const testUsers = [
    {
      email: 'customer1@onelink.ng',
      password: 'Customer123!',
      firstName: 'Adebayo',
      lastName: 'Oladapo',
      phone: '+2348012345678',
      role: 'CUSTOMER'
    },
    {
      email: 'customer2@onelink.ng',
      password: 'Customer123!',
      firstName: 'Chiamaka',
      lastName: 'Okoro',
      phone: '+2348023456789',
      role: 'CUSTOMER'
    },
    {
      email: 'customer3@onelink.ng',
      password: 'Customer123!',
      firstName: 'Olumide',
      lastName: 'Adebayo',
      phone: '+2348034567890',
      role: 'CUSTOMER'
    },
    {
      email: 'admin@onelink.ng',
      password: 'Admin123!',
      firstName: 'Ibrahim',
      lastName: 'Mohammed',
      phone: '+2348045678901',
      role: 'ADMIN'
    },
    {
      email: 'superadmin@onelink.ng',
      password: 'SuperAdmin123!',
      firstName: 'Funmi',
      lastName: 'Adebayo',
      phone: '+2348056789012',
      role: 'SUPERADMIN'
    }
  ];

  const createdUsers = [];
  
  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role as 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });
    createdUsers.push(user);
  }

  console.log(`✅ Created ${createdUsers.length} test users`);

  // Create sample subscriptions for customers
  console.log('📋 Creating sample subscriptions...');
  
  const customers = createdUsers.filter(u => u.role === 'CUSTOMER');
  
  for (const customer of customers) {
    const randomPlan = createdPlans[Math.floor(Math.random() * createdPlans.length)];
    const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const nextRenewal = new Date(startDate);
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    
    await prisma.userSubscription.create({
      data: {
        userId: customer.id,
        planId: randomPlan.id,
        startDate,
        nextRenewal,
        monthlyFee: randomPlan.price,
        address: `${Math.floor(Math.random() * 100) + 1} Sample Street, ${randomPlan.region}`,
        installationDate: new Date(startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✅ Created ${customers.length} subscriptions`);

  // Create sample usage data
  console.log('📈 Creating sample usage data...');
  
  const periods = ['2024-11', '2024-12', '2025-01'];
  
  for (const customer of customers) {
    for (const period of periods) {
      await prisma.usageData.create({
        data: {
          userId: customer.id,
          period,
          dataUsed: Math.floor(Math.random() * 500) + 100,
          dataLimit: -1, // unlimited
        },
      });
    }
  }

  console.log(`✅ Created ${customers.length * periods.length} usage data records`);

  // Create sample speed tests
  console.log('🚀 Creating sample speed tests...');
  
  let speedTestCount = 0;
  for (const customer of customers) {
    for (let i = 0; i < 5; i++) {
      await prisma.speedTestResult.create({
        data: {
          userId: customer.id,
          downloadSpeed: Math.floor(Math.random() * 100) + 10,
          uploadSpeed: Math.floor(Math.random() * 50) + 5,
          ping: Math.floor(Math.random() * 50) + 10,
          jitter: Math.floor(Math.random() * 10) + 1,
          location: regions[Math.floor(Math.random() * regions.length)],
          serverId: `server-${Math.floor(Math.random() * 5) + 1}`,
        },
      });
      speedTestCount++;
    }
  }

  console.log(`✅ Created ${speedTestCount} speed test results`);

  // Create sample support tickets
  console.log('🎫 Creating sample support tickets...');
  
  const ticketSubjects = [
    'Internet connection issue',
    'Slow speeds experienced',
    'Billing inquiry',
    'Installation appointment',
    'Technical support needed'
  ];
  
  for (const customer of customers) {
    const randomSubject = ticketSubjects[Math.floor(Math.random() * ticketSubjects.length)];
    await prisma.supportTicket.create({
      data: {
        userId: customer.id,
        subject: randomSubject,
        description: `I need help with ${randomSubject.toLowerCase()}. Please assist me as soon as possible.`,
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH',
      },
    });
  }

  console.log(`✅ Created ${customers.length} support tickets`);

  // Create sample payments
  console.log('💳 Creating sample payments...');
  
  for (const customer of customers) {
    const randomPlan = createdPlans[Math.floor(Math.random() * createdPlans.length)];
    await prisma.paymentTransaction.create({
      data: {
        userId: customer.id,
        amount: randomPlan.price,
        gateway: ['PAYSTACK', 'FLUTTERWAVE', 'QUICKTELLER'][Math.floor(Math.random() * 3)] as 'PAYSTACK' | 'FLUTTERWAVE' | 'QUICKTELLER',
        reference: `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        description: 'Monthly subscription payment',
        status: 'SUCCESSFUL',
      },
    });
  }

  console.log(`✅ Created ${customers.length} payment transactions`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${createdPlans.length} service plans`);
  console.log(`- ${createdUsers.length} users`);
  console.log(`- ${customers.length} subscriptions`);
  console.log(`- ${customers.length * periods.length} usage records`);
  console.log(`- ${speedTestCount} speed tests`);
  console.log(`- ${customers.length} support tickets`);
  console.log(`- ${customers.length} payment transactions`);
  console.log('\n🔐 Test Account Credentials:');
  console.log('Customer: customer1@onelink.ng / Customer123!');
  console.log('Admin: admin@onelink.ng / Admin123!');
  console.log('SuperAdmin: superadmin@onelink.ng / SuperAdmin123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
