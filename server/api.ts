import express from 'express';
import cors from 'cors';
import { prisma } from './models/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    const planCount = await prisma.servicePlan.count();
    const userCount = await prisma.user.count();
    
    res.json({ 
      success: true, 
      message: 'One Link Internet API is running',
      database: 'Connected',
      data: {
        servicePlans: planCount,
        users: userCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all service plans
app.get('/api/plans', async (req, res) => {
  try {
    const region = req.query.region as string;
    let plans;
    
    if (region) {
      plans = await prisma.servicePlan.findMany({
        where: { 
          region: region,
          isActive: true 
        },
        orderBy: {
          price: 'asc'
        }
      });
    } else {
      plans = await prisma.servicePlan.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { region: 'asc' },
          { price: 'asc' }
        ]
      });
    }
    
    // Convert price from kobo to naira
    const plansWithNairaPrice = plans.map(plan => ({
      ...plan,
      price: plan.price / 100,
      priceFormatted: `₦${(plan.price / 100).toLocaleString()}`
    }));
    
    res.json({
      success: true,
      data: plansWithNairaPrice,
      count: plansWithNairaPrice.length
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get regions
app.get('/api/regions', async (req, res) => {
  try {
    const regions = await prisma.servicePlan.findMany({
      select: {
        region: true
      },
      distinct: ['region'],
      where: {
        isActive: true
      }
    });
    
    res.json({
      success: true,
      data: regions.map(r => r.region),
      count: regions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get plan by ID
app.get('/api/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.servicePlan.findUnique({
      where: { id }
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Service plan not found'
      });
    }
    
    const planWithNairaPrice = {
      ...plan,
      price: plan.price / 100,
      priceFormatted: `₦${(plan.price / 100).toLocaleString()}`
    };
    
    res.json({
      success: true,
      data: planWithNairaPrice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/plans',
      'GET /api/regions',
      'GET /api/plans/:id'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 One Link Internet API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Service plans: http://localhost:${PORT}/api/plans`);
  console.log(`🌍 Regions: http://localhost:${PORT}/api/regions`);
});

export default app;
