import http from 'http';
import { parse } from 'url';
import { parse as parseQuery } from 'querystring';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './models/database';
import { setupSocketIO, sendNotificationViaSocket } from './socket';

// Rate limiting for authentication
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDuration: 15 * 60 * 1000 // 15 minutes
};

// Rate limiting function
function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; resetTime?: Date } {
  const now = new Date();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 };
  }
  
  const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime();
  
  // Reset if window has passed
  if (timeSinceLastAttempt > RATE_LIMIT.windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 };
  }
  
  // Check if blocked
  if (attempts.count >= RATE_LIMIT.maxAttempts) {
    const resetTime = new Date(attempts.lastAttempt.getTime() + RATE_LIMIT.blockDuration);
    return { allowed: false, remainingAttempts: 0, resetTime };
  }
  
  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  
  return { 
    allowed: true, 
    remainingAttempts: RATE_LIMIT.maxAttempts - attempts.count 
  };
}

// Password reset tokens storage
const passwordResetTokens = new Map<string, { userId: string; token: string; expires: Date }>();

// Generate password reset token
function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const PORT = 5000;

// In-memory session storage for simplicity
const sessions = new Map<string, { userId: string; createdAt: Date }>();

// Generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^(\+234|234|0)[789][01]\d{8}$/, 'Invalid Nigerian phone number')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Helper function to get request body
function getRequestBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', (error: any) => {
      reject(error);
    });
  });
}

// Get session from cookie
function getSessionFromCookie(cookie: string): string | null {
  if (!cookie) return null;
  const sessionMatch = cookie.match(/sessionId=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
}

// Get user from session
async function getUserFromSession(sessionId: string | null) {
  if (!sessionId || !sessions.has(sessionId)) return null;
  
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    return user;
  } catch (error) {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = parse(req.url || '', true);
  const path = url.pathname;
  const method = req.method;
  
  try {
    if (path === '/api/health') {
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
      
    } else if (path === '/api/auth/register' && method === 'POST') {
      // User registration
      try {
        const body = await getRequestBody(req);
        const requestData = JSON.parse(body);
        const validatedData = registerSchema.parse(requestData);
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email }
        });
        
        if (existingUser) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'User with this email already exists'
          }));
          return;
        }

        // Check if phone number already exists
        const existingPhone = await prisma.user.findUnique({
          where: { phone: validatedData.phone }
        });
        
        if (existingPhone) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'User with this phone number already exists'
          }));
          return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const user = await prisma.user.create({
          data: {
            email: validatedData.email,
            passwordHash,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            role: 'CUSTOMER',
            isEmailVerified: false,
            isPhoneVerified: false
          }
        });

        // Create session
        const sessionId = generateSessionId();
        sessions.set(sessionId, { userId: user.id, createdAt: new Date() });

        // Set session cookie
        res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`);

        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = user;
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'User registered successfully',
          data: userWithoutPassword
        }));
      } catch (error) {
        console.error('Registration error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          message: 'Registration failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
      
    } else if (path === '/api/auth/login' && method === 'POST') {
      // User login
      try {
        const body = await getRequestBody(req);
        const requestData = JSON.parse(body);
        const validatedData = loginSchema.parse(requestData);
        
        // Rate limiting
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const rateLimit = checkRateLimit(ip as string);
        
        if (!rateLimit.allowed) {
          const retryAfter = rateLimit.resetTime ? rateLimit.resetTime.getTime() - Date.now() : 900000;
          res.writeHead(429, {
            'Retry-After': Math.ceil(retryAfter / 1000).toString(),
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            success: false,
            message: 'Too many login attempts. Please try again later.'
          }));
          return;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: validatedData.email }
        });
        
        if (!user) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid email or password'
          }));
          return;
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
        
        if (!isPasswordValid) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid email or password'
          }));
          return;
        }

        // Create session
        const sessionId = generateSessionId();
        sessions.set(sessionId, { userId: user.id, createdAt: new Date() });

        // Set session cookie
        res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`);

        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = user;
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful',
          data: userWithoutPassword
        }));
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          message: 'Login failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
      
    } else if (path === '/api/auth/logout' && method === 'POST') {
      // User logout
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (sessionId) {
        sessions.delete(sessionId);
      }
      
      res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      }));
      
    } else if (path === '/api/auth/me' && method === 'GET') {
      // Get current user
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      const user = await getUserFromSession(sessionId);
      
      if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Not authenticated'
        }));
        return;
      }
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: userWithoutPassword
      }));
      
    } else if (path === '/api/auth/forgot-password' && method === 'POST') {
      // Password reset request
      try {
        const body = await getRequestBody(req);
        const requestData = JSON.parse(body);
        const { email } = requestData;
        
        if (!email) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Email is required'
          }));
          return;
        }
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email }
        });
        
        if (!user) {
          // Don't reveal if email exists
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
          }));
          return;
        }
        
        // Generate reset token
        const resetToken = generateResetToken();
        const expires = new Date(Date.now() + 3600000); // 1 hour
        
        passwordResetTokens.set(email, { 
          userId: user.id, 
          token: resetToken, 
          expires 
        });
        
        // In production, send email here
        console.log(`Password reset token for ${email}: ${resetToken}`);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
          // For testing only - remove in production
          resetToken: resetToken
        }));
        
      } catch (error) {
        console.error('Forgot password error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          message: 'Failed to process password reset request'
        }));
      }
      
    } else if (path === '/api/auth/reset-password' && method === 'POST') {
      // Password reset
      try {
        const body = await getRequestBody(req);
        const requestData = JSON.parse(body);
        const { email, token, newPassword } = requestData;
        
        if (!email || !token || !newPassword) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Email, token, and new password are required'
          }));
          return;
        }
        
        // Validate password
        if (newPassword.length < 8) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Password must be at least 8 characters'
          }));
          return;
        }
        
        // Check token
        const resetData = passwordResetTokens.get(email);
        if (!resetData || resetData.token !== token || resetData.expires < new Date()) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid or expired reset token'
          }));
          return;
        }
        
        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        
        // Update user password
        await prisma.user.update({
          where: { id: resetData.userId },
          data: { passwordHash }
        });
        
        // Remove used token
        passwordResetTokens.delete(email);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Password reset successfully'
        }));
        
      } catch (error) {
        console.error('Reset password error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          message: 'Failed to reset password'
        }));
      }

    } else if (path === '/api/plans') {
      // Get all plans
      const region = url.query.region as string;
      let plans;
      
      if (region) {
        plans = await prisma.servicePlan.findMany({
          where: { 
            region: region,
            isActive: true 
          },
          orderBy: { price: 'asc' }
        });
      } else {
        plans = await prisma.servicePlan.findMany({
          where: { isActive: true },
          orderBy: [{ region: 'asc' }, { price: 'asc' }]
        });
      }
      
      const plansWithNairaPrice = plans.map((plan: any) => ({
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
      
    } else if (path === '/api/regions') {
      // Get regions
      const regions = await prisma.servicePlan.findMany({
        select: { region: true },
        distinct: ['region'],
        where: { isActive: true }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: regions.map((r: any) => r.region),
        count: regions.length
      }));
      
    } else if (path === '/api/subscriptions' && method === 'POST') {
      // Create a new subscription
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      // Validate required fields
      const subscriptionSchema = z.object({
        planId: z.string().min(1, 'Plan ID is required'),
        address: z.string().min(10, 'Full address is required'),
        installationDate: z.string().optional()
      });
      
      try {
        const validatedData = subscriptionSchema.parse(data);
        
        // Check if plan exists
        const plan = await prisma.servicePlan.findUnique({
          where: { id: validatedData.planId }
        });
        
        if (!plan) {
          res.writeHead(404);
          res.end(JSON.stringify({
            success: false,
            message: 'Service plan not found'
          }));
          return;
        }
        
        // Check if user already has an active subscription
        const existingSubscription = await prisma.userSubscription.findFirst({
          where: {
            userId: session.userId,
            status: 'ACTIVE'
          }
        });
        
        if (existingSubscription) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'You already have an active subscription'
          }));
          return;
        }
        
        // Create subscription
        const startDate = new Date();
        const nextRenewal = new Date(startDate);
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        
        const subscription = await prisma.userSubscription.create({
          data: {
            userId: session.userId,
            planId: validatedData.planId,
            status: 'ACTIVE',
            startDate,
            nextRenewal,
            monthlyFee: plan.price,
            address: validatedData.address,
            installationDate: validatedData.installationDate ? new Date(validatedData.installationDate) : null
          },
          include: {
            plan: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        });
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Subscription created successfully',
          data: {
            ...subscription,
            plan: {
              ...subscription.plan,
              priceInNaira: subscription.plan.price / 100
            }
          }
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }
      
    } else if (path === '/api/subscriptions' && method === 'GET') {
      // Get user subscriptions
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const subscriptions = await prisma.userSubscription.findMany({
        where: { userId: session.userId },
        include: {
          plan: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      const subscriptionsWithNairaPrice = subscriptions.map((sub: any) => ({
        ...sub,
        plan: {
          ...sub.plan,
          priceInNaira: sub.plan.price / 100
        }
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: subscriptionsWithNairaPrice,
        count: subscriptionsWithNairaPrice.length
      }));
      
    } else if (path && path.startsWith('/api/subscriptions/') && method === 'PUT') {
      // Update subscription status
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const subscriptionId = path.split('/')[3];
      const session = sessions.get(sessionId)!;
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      // Validate the update
      const updateSchema = z.object({
        status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
        address: z.string().optional()
      });
      
      try {
        const validatedData = updateSchema.parse(data);
        
        // Check if subscription belongs to user
        const subscription = await prisma.userSubscription.findFirst({
          where: {
            id: subscriptionId,
            userId: session.userId
          }
        });
        
        if (!subscription) {
          res.writeHead(404);
          res.end(JSON.stringify({
            success: false,
            message: 'Subscription not found'
          }));
          return;
        }
        
        // Update subscription
        const updatedSubscription = await prisma.userSubscription.update({
          where: { id: subscriptionId },
          data: validatedData,
          include: {
            plan: true
          }
        });
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Subscription updated successfully',
          data: {
            ...updatedSubscription,
            plan: {
              ...updatedSubscription.plan,
              priceInNaira: updatedSubscription.plan.price / 100
            }
          }
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }
      
    } else if (path === '/api/payments' && method === 'POST') {
      // Initialize payment
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      const paymentSchema = z.object({
        amount: z.number().min(100, 'Minimum amount is ₦1'),
        gateway: z.enum(['PAYSTACK', 'FLUTTERWAVE', 'QUICKTELLER']),
        description: z.string().min(1, 'Description is required')
      });
      
      try {
        const validatedData = paymentSchema.parse(data);
        
        // Generate payment reference
        const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Create payment record
        const payment = await prisma.paymentTransaction.create({
          data: {
            userId: session.userId,
            amount: validatedData.amount * 100, // Convert to kobo
            gateway: validatedData.gateway,
            reference,
            description: validatedData.description,
            status: 'PENDING'
          }
        });
        
        // Simulate payment gateway response
        const paymentUrl = `https://${validatedData.gateway.toLowerCase()}.co/pay/${reference}`;
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Payment initialized successfully',
          data: {
            reference,
            paymentUrl,
            amount: validatedData.amount,
            gateway: validatedData.gateway
          }
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }
      
    } else if (path === '/api/payments/verify' && method === 'POST') {
      // Verify payment (simulate webhook)
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      const verifySchema = z.object({
        reference: z.string().min(1, 'Reference is required'),
        status: z.enum(['successful', 'failed']).optional().default('successful')
      });
      
      try {
        const validatedData = verifySchema.parse(data);
        
        const payment = await prisma.paymentTransaction.findUnique({
          where: { reference: validatedData.reference }
        });
        
        if (!payment) {
          res.writeHead(404);
          res.end(JSON.stringify({
            success: false,
            message: 'Payment not found'
          }));
          return;
        }
        
        // Update payment status
        const updatedPayment = await prisma.paymentTransaction.update({
          where: { reference: validatedData.reference },
          data: {
            status: validatedData.status === 'successful' ? 'SUCCESSFUL' : 'FAILED'
          }
        });
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Payment verified successfully',
          data: {
            ...updatedPayment,
            amountInNaira: updatedPayment.amount / 100
          }
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }
      
    } else if (path === '/api/payments' && method === 'GET') {
      // Get user payment history
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const payments = await prisma.paymentTransaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' }
      });
      
      const paymentsWithNaira = payments.map((payment: any) => ({
        ...payment,
        amountInNaira: payment.amount / 100
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: paymentsWithNaira,
        count: paymentsWithNaira.length
      }));
      
    } else if (path === '/api/usage' && method === 'GET') {
      // Get user usage data
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const usageData = await prisma.usageData.findMany({
        where: { userId: session.userId },
        orderBy: { period: 'desc' },
        take: 12 // Last 12 months
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: usageData,
        count: usageData.length
      }));
      
    } else if (path === '/api/speed-tests' && method === 'POST') {
      // Create speed test result
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      const speedTestSchema = z.object({
        downloadSpeed: z.number().min(0),
        uploadSpeed: z.number().min(0),
        ping: z.number().min(0),
        jitter: z.number().min(0),
        location: z.string().min(1),
        serverId: z.string().min(1)
      });
      
      try {
        const validatedData = speedTestSchema.parse(data);
        
        const speedTest = await prisma.speedTestResult.create({
          data: {
            userId: session.userId,
            ...validatedData
          }
        });
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Speed test result saved',
          data: speedTest
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }
      
    } else if (path === '/api/speed-tests' && method === 'GET') {
      // Get user speed test history
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const speedTests = await prisma.speedTestResult.findMany({
        where: { userId: session.userId },
        orderBy: { testDate: 'desc' },
        take: 20
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: speedTests,
        count: speedTests.length
      }));
      
    } else if (path === '/api/tickets' && method === 'POST') {
      // Create support ticket
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      const ticketSchema = z.object({
        subject: z.string().min(5, 'Subject must be at least 5 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM')
      });
      
      try {
        const validatedData = ticketSchema.parse(data);
        
        const ticket = await prisma.supportTicket.create({
          data: {
            userId: session.userId,
            subject: validatedData.subject,
            description: validatedData.description,
            priority: validatedData.priority,
            status: 'OPEN'
          }
        });
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Support ticket created successfully',
          data: ticket
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }
      
    } else if (path === '/api/tickets' && method === 'GET') {
      // Get user support tickets
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const tickets = await prisma.supportTicket.findMany({
        where: { userId: session.userId },
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            },
            orderBy: { sentAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: tickets,
        count: tickets.length
      }));

    } else if (path === '/api/admin/users' && method === 'GET') {
      // Get all users (Admin only)
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      if (!user || user.role !== 'ADMIN') {
        res.writeHead(403);
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
          subscriptions: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: users,
        count: users.length
      }));

    } else if (path === '/api/admin/analytics' && method === 'GET') {
      // Get admin analytics
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      if (!user || user.role !== 'ADMIN') {
        res.writeHead(403);
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }
      
      // Get analytics data
      const totalUsers = await prisma.user.count();
      const totalSubscriptions = await prisma.userSubscription.count();
      const activeSubscriptions = await prisma.userSubscription.count({
        where: { status: 'ACTIVE' }
      });
      const totalRevenue = await prisma.paymentTransaction.aggregate({
        where: { status: 'SUCCESSFUL' },
        _sum: { amount: true }
      });
      const totalTickets = await prisma.supportTicket.count();
      const openTickets = await prisma.supportTicket.count({
        where: { status: 'OPEN' }
      });
      
      // Monthly growth data
      const monthlyUsers = await prisma.user.findMany({
        select: {
          createdAt: true
        },
        where: {
          createdAt: {
            gte: new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      });
      
      // Group by month
      const userGrowth = monthlyUsers.reduce((acc: any, user: any) => {
        const month = user.createdAt.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      
      const analytics = {
        totalUsers,
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount ? totalRevenue._sum.amount / 100 : 0,
        totalTickets,
        openTickets,
        userGrowth: Object.entries(userGrowth).map(([month, count]) => ({
          month,
          users: count
        }))
      };
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: analytics
      }));

    } else if (path === '/api/admin/tickets' && method === 'GET') {
      // Get all support tickets (Admin only)
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      if (!user || user.role !== 'ADMIN') {
        res.writeHead(403);
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }
      
      const tickets = await prisma.supportTicket.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          messages: {
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            },
            orderBy: { sentAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: tickets,
        count: tickets.length
      }));

    } else if (path && path.startsWith('/api/admin/tickets/') && method === 'PUT') {
      // Update ticket status (Admin only)
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      if (!user || user.role !== 'ADMIN') {
        res.writeHead(403);
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }
      
      const ticketId = path.split('/')[4];
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      const updateTicketSchema = z.object({
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional()
      });
      
      try {
        const validatedData = updateTicketSchema.parse(data);
        
        const ticket = await prisma.supportTicket.update({
          where: { id: ticketId },
          data: validatedData,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Ticket updated successfully',
          data: ticket
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }

    } else if (path === '/api/admin/notifications' && method === 'POST') {
      // Send notification to users (Admin only)
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      if (!user || user.role !== 'ADMIN') {
        res.writeHead(403);
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }
      
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      
      const notificationSchema = z.object({
        title: z.string().min(1, 'Title is required'),
        message: z.string().min(1, 'Message is required'),
        type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).default('INFO'),
        userIds: z.array(z.string()).optional() // If not provided, send to all users
      });
      
      try {
        const validatedData = notificationSchema.parse(data);
        
        let targetUsers: string[];
        if (validatedData.userIds && validatedData.userIds.length > 0) {
          targetUsers = validatedData.userIds;
        } else {
          // Send to all users
          const allUsers = await prisma.user.findMany({
            select: { id: true }
          });
          targetUsers = allUsers.map((u: any) => u.id);
        }
        
        // Create notifications for all target users
        const notifications = await Promise.all(
          targetUsers.map(userId => 
            prisma.notification.create({
              data: {
                userId,
                title: validatedData.title,
                message: validatedData.message,
                type: validatedData.type,
                isRead: false
              }
            })
          )
        );
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: `Notification sent to ${notifications.length} users`,
          data: { count: notifications.length }
        }));
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          }));
        } else {
          throw error;
        }
      }

    } else if (path === '/api/notifications' && method === 'GET') {
      // Get user notifications
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const session = sessions.get(sessionId)!;
      const notifications = await prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: notifications,
        count: notifications.length
      }));
      
    } else if (path && path.startsWith('/api/notifications/') && method === 'PUT') {
      // Mark notification as read
      const sessionId = getSessionFromCookie(req.headers.cookie || '');
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }));
        return;
      }
      
      const notificationId = path.split('/')[3];
      const session = sessions.get(sessionId)!;
      
      const notification = await prisma.notification.updateMany({
        where: { 
          id: notificationId,
          userId: session.userId
        },
        data: { isRead: true }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Notification marked as read'
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
          'GET /api/regions',
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/me',
          'POST /api/subscriptions',
          'GET /api/subscriptions',
          'PUT /api/subscriptions/:id',
          'POST /api/payments',
          'POST /api/payments/verify',
          'GET /api/payments',
          'GET /api/usage',
          'POST /api/speed-tests',
          'GET /api/speed-tests',
          'POST /api/tickets',
          'GET /api/tickets',
          'GET /api/admin/users',
          'GET /api/admin/analytics',
          'GET /api/admin/tickets',
          'PUT /api/admin/tickets/:id',
          'POST /api/admin/notifications',
          'GET /api/notifications',
          'PUT /api/notifications/:id'
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
  console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔑 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Profile: http://localhost:${PORT}/api/auth/me`);
  console.log(`🌍 Regions: http://localhost:${PORT}/api/regions`);
  console.log(`📦 Subscriptions: http://localhost:${PORT}/api/subscriptions`);
  console.log(`💰 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`🛠️ Support Tickets: http://localhost:${PORT}/api/tickets`);
  console.log(`📊 Speed Tests: http://localhost:${PORT}/api/speed-tests`);
  console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/api/admin/users`);
  console.log(`🔥 Socket.io Real-time: ws://localhost:${PORT}`);
  console.log(`\n✅ Your Neon database is connected and full platform is ready!`);
});

// Setup Socket.io
const io = setupSocketIO(server);

export default server;
