import { prisma } from './models/database';

async function testDatabase() {
  console.log('🧪 Testing database connection...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const plans = await prisma.servicePlan.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        price: true,
        region: true,
        isActive: true
      }
    });
    
    console.log(`✅ Found ${plans.length} service plans:`);
    plans.forEach((plan: any, index: number) => {
      console.log(`   ${index + 1}. ${plan.name} - ₦${plan.price/100}/month (${plan.region})`);
    });
    
    // Test users
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    console.log(`✅ Found ${users.length} test users:`);
    users.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🎉 Database test completed successfully!');
    console.log('🔗 Your Neon database is working perfectly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
