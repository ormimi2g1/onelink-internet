import http from 'http';
import { prisma } from './models/database';

const PORT = 5000;

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (req.url === '/api/health') {
      // Health check
      await prisma.$connect();
      const planCount = await prisma.servicePlan.count();
      const userCount = await prisma.user.count();
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'One Link Internet API is running',
        database: 'Connected ✅',
        data: {
          servicePlans: planCount,
          users: userCount
        },
        timestamp: new Date().toISOString()
      }));
      
    } else if (req.url === '/api/plans') {
      // Get all plans
      const plans = await prisma.servicePlan.findMany({
        where: { isActive: true },
        orderBy: [{ region: 'asc' }, { price: 'asc' }]
      });
      
      const plansWithNairaPrice = plans.map(plan => ({
        ...plan,
        price: plan.price / 100,
        priceFormatted: `₦${(plan.price / 100).toLocaleString()}`
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: plansWithNairaPrice,
        count: plansWithNairaPrice.length
      }));
      
    } else if (req.url === '/api/regions') {
      // Get regions
      const regions = await prisma.servicePlan.findMany({
        select: { region: true },
        distinct: ['region'],
        where: { isActive: true }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: regions.map(r => r.region),
        count: regions.length
      }));
      
    } else {
      // 404
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: [
          'GET /api/health',
          'GET /api/plans',
          'GET /api/regions'
        ]
      }));
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 One Link Internet API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Service plans: http://localhost:${PORT}/api/plans`);
  console.log(`🌍 Regions: http://localhost:${PORT}/api/regions`);
  console.log(`\n✅ Your Neon database is connected and working!`);
});

export default server;
