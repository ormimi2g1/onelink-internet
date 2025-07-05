export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'customer' | 'admin' | 'superadmin'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  profileImageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface ServicePlan {
  id: string
  name: string
  region: string
  speed: string
  price: number
  currency: 'NGN'
  type: 'residential' | 'sme' | 'enterprise'
  features: string[]
  isActive: boolean
  description: string
  createdAt: Date
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'suspended' | 'cancelled'
  startDate: Date
  nextRenewal: Date
  monthlyFee: number
  address: string
  installationDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UsageData {
  id: string
  userId: string
  period: string // YYYY-MM format
  dataUsed: number // GB
  dataLimit: number // GB (unlimited = -1)
  speedTests: SpeedTestResult[]
  createdAt: Date
  updatedAt: Date
}

export interface SpeedTestResult {
  id: string
  userId: string
  downloadSpeed: number // Mbps
  uploadSpeed: number // Mbps
  ping: number // ms
  jitter: number // ms
  location: string
  testDate: Date
  serverId: string
}

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedAgent?: string
  messages: TicketMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface TicketMessage {
  id: string
  senderId: string
  message: string
  timestamp: Date
  isAgent: boolean
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  message: string
  type: 'text' | 'image' | 'file'
  timestamp: Date
  isRead: boolean
}

export interface PaymentTransaction {
  id: string
  userId: string
  amount: number
  currency: 'NGN'
  gateway: 'paystack' | 'flutterwave' | 'quickteller'
  reference: string
  status: 'pending' | 'successful' | 'failed'
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface NetworkOutage {
  id: string
  region: string
  description: string
  status: 'ongoing' | 'resolved'
  startTime: Date
  endTime?: Date
  affectedUsers: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: any[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
}

export interface AppConfig {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
}

export type Theme = 'light' | 'dark' | 'system'

export interface Project {
  id: string
  name: string
  description: string
  owner: User
  collaborators: User[]
  createdAt: Date
  updatedAt: Date
}
