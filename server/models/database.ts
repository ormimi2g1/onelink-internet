import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Create a single instance of Prisma Client
export const prisma = globalThis.prisma || new PrismaClient();

// In development, store the instance on the global object
// to prevent multiple instances due to hot reloading
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

// Database service class with methods for all operations
export class DatabaseService {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  // User operations
  async createUser(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN';
  }) {
    return this.db.user.create({
      data: userData,
    });
  }

  async getUserById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async getUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, data: any) {
    return this.db.user.update({
      where: { id },
      data,
    });
  }

  async getAllUsers() {
    return this.db.user.findMany({
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
      },
    });
  }

  // Service plan operations
  async getAllPlans() {
    return this.db.servicePlan.findMany({
      where: { isActive: true },
      orderBy: [
        { region: 'asc' },
        { price: 'asc' },
      ],
    });
  }

  async getPlansByRegion(region: string) {
    return this.db.servicePlan.findMany({
      where: { 
        region: region,
        isActive: true 
      },
      orderBy: { price: 'asc' },
    });
  }

  async getPlanById(id: string) {
    return this.db.servicePlan.findUnique({
      where: { id },
    });
  }

  async createPlan(planData: {
    name: string;
    region: string;
    speed: string;
    price: number;
    type: 'RESIDENTIAL' | 'SME' | 'ENTERPRISE';
    features: string[];
    description: string;
  }) {
    return this.db.servicePlan.create({
      data: planData,
    });
  }

  // Subscription operations
  async createSubscription(subscriptionData: {
    userId: string;
    planId: string;
    startDate: Date;
    nextRenewal: Date;
    monthlyFee: number;
    address: string;
    installationDate?: Date;
  }) {
    return this.db.userSubscription.create({
      data: subscriptionData,
      include: {
        user: true,
        plan: true,
      },
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.db.userSubscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSubscription(id: string, data: any) {
    return this.db.userSubscription.update({
      where: { id },
      data,
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Usage data operations
  async createUsageData(usageData: {
    userId: string;
    period: string;
    dataUsed: number;
    dataLimit: number;
  }) {
    return this.db.usageData.upsert({
      where: {
        userId_period: {
          userId: usageData.userId,
          period: usageData.period,
        },
      },
      update: {
        dataUsed: usageData.dataUsed,
        dataLimit: usageData.dataLimit,
      },
      create: usageData,
    });
  }

  async getUserUsage(userId: string, limit: number = 12) {
    return this.db.usageData.findMany({
      where: { userId },
      orderBy: { period: 'desc' },
      take: limit,
    });
  }

  // Speed test operations
  async createSpeedTest(speedTestData: {
    userId: string;
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    jitter: number;
    location: string;
    serverId: string;
  }) {
    return this.db.speedTestResult.create({
      data: speedTestData,
    });
  }

  async getUserSpeedTests(userId: string, limit: number = 10) {
    return this.db.speedTestResult.findMany({
      where: { userId },
      orderBy: { testDate: 'desc' },
      take: limit,
    });
  }

  // Support ticket operations
  async createTicket(ticketData: {
    userId: string;
    subject: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    return this.db.supportTicket.create({
      data: ticketData,
      include: {
        user: true,
        messages: true,
      },
    });
  }

  async getUserTickets(userId: string) {
    return this.db.supportTicket.findMany({
      where: { userId },
      include: {
        messages: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketById(id: string) {
    return this.db.supportTicket.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          include: {
            sender: true,
          },
          orderBy: { sentAt: 'asc' },
        },
      },
    });
  }

  async updateTicket(id: string, data: any) {
    return this.db.supportTicket.update({
      where: { id },
      data,
    });
  }

  async addTicketMessage(messageData: {
    ticketId: string;
    senderId: string;
    message: string;
    isAgent: boolean;
  }) {
    return this.db.ticketMessage.create({
      data: messageData,
      include: {
        sender: true,
      },
    });
  }

  // Payment operations
  async createPayment(paymentData: {
    userId: string;
    amount: number;
    gateway: 'PAYSTACK' | 'FLUTTERWAVE' | 'QUICKTELLER';
    reference: string;
    description: string;
  }) {
    return this.db.paymentTransaction.create({
      data: paymentData,
    });
  }

  async getUserPayments(userId: string) {
    return this.db.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePayment(id: string, data: any) {
    return this.db.paymentTransaction.update({
      where: { id },
      data,
    });
  }

  async getPaymentByReference(reference: string) {
    return this.db.paymentTransaction.findUnique({
      where: { reference },
    });
  }

  // Network outage operations
  async createOutage(outageData: {
    region: string;
    description: string;
    startTime: Date;
    affectedUsers: string[];
    reporterId?: string;
  }) {
    return this.db.networkOutage.create({
      data: outageData,
    });
  }

  async getActiveOutages() {
    return this.db.networkOutage.findMany({
      where: { status: 'ONGOING' },
      orderBy: { startTime: 'desc' },
    });
  }

  async getOutagesByRegion(region: string) {
    return this.db.networkOutage.findMany({
      where: { region },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateOutage(id: string, data: any) {
    return this.db.networkOutage.update({
      where: { id },
      data,
    });
  }

  // Analytics operations
  async getSubscriptionStats() {
    return this.db.userSubscription.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });
  }

  async getRevenueStats() {
    return this.db.paymentTransaction.aggregate({
      where: { status: 'SUCCESSFUL' },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getUserGrowthStats() {
    return this.db.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Database health check
  async healthCheck() {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error', 
        timestamp: new Date() 
      };
    }
  }

  // Cleanup and disconnect
  async disconnect() {
    await this.db.$disconnect();
  }
}

// Export singleton instance
export const db = new DatabaseService();
