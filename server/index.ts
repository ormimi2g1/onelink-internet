import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db } from './models/database';
import { User } from './models/types';
import authRoutes from './routes/auth';

// Import types
import './types/express-session.d.ts';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secure-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// User authentication middleware
app.use((req, res, next) => {
  if (req.session.userId) {
    const user = db.getUserById(req.session.userId);
    req.user = user;
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'One Link Internet API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);

// Public route for service plans
app.get('/api/plans', (req, res) => {
  const region = req.query.region as string;
  const plans = region ? db.getPlansByRegion(region) : db.getAllPlans();
  
  res.json({
    success: true,
    data: plans
  });
});

// Protected routes
app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const { passwordHash, ...userWithoutPassword } = req.user;
  
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

app.get('/api/user/subscriptions', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const subscriptions = db.getUserSubscriptions(req.user.id);
  
  res.json({
    success: true,
    data: subscriptions
  });
});

app.get('/api/user/usage', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const usage = db.getUserUsage(req.user.id);
  
  res.json({
    success: true,
    data: usage
  });
});

app.get('/api/user/speedtests', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const speedTests = db.getUserSpeedTests(req.user.id);
  
  res.json({
    success: true,
    data: speedTests
  });
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

app.listen(PORT, () => {
  console.log(`🚀 One Link Internet API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 In-memory database initialized with sample data`);
});
