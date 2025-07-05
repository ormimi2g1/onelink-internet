import express from 'express';
import cors from 'cors';
import { db } from './models/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    res.json({ 
      success: true, 
      message: 'One Link Internet API is running',
      database: dbHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all plans
app.get('/api/plans', async (req, res) => {
  try {
    const region = req.query.region as string;
    const plans = region ? await db.getPlansByRegion(region) : await db.getAllPlans();
    
    // Convert price from kobo to naira for frontend
    const plansWithNairaPrice = plans.map((plan: any) => ({
      ...plan,
      price: plan.price / 100 // Convert from kobo to naira
    }));
    
    res.json({
      success: true,
      data: plansWithNairaPrice
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get plans by region
app.get('/api/plans/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const plans = await db.getPlansByRegion(region);
    
    // Convert price from kobo to naira for frontend
    const plansWithNairaPrice = plans.map((plan: any) => ({
      ...plan,
      price: plan.price / 100 // Convert from kobo to naira
    }));
    
    res.json({
      success: true,
      data: plansWithNairaPrice
    });
  } catch (error) {
    console.error('Error fetching plans by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 One Link Internet API server running on port ${PORT}`);
  console.log(`�️ PostgreSQL database connected with Prisma ORM`);
  console.log(`📊 Use 'npm run db:seed' to populate with sample data`);
});

export default app;
