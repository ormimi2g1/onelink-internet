# Complete Nigerian Telecom Platform - Production-Deployable Recreation Prompt

Build a comprehensive Nigerian telecom/broadband service platform branded as "One Link Internet" with all features matching and exceeding FiberOne Broadband (fob.ng) capabilities. This is a complete production-ready system with temporary memory database.

## Core Architecture & Technology Stack

### Frontend Stack
- **Framework**: React.js with TypeScript (latest)
- **Routing**: Wouter for SPA routing
- **State Management**: TanStack Query v5 for server state
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for analytics and usage visualization
- **Icons**: Lucide React + React Icons (for logos)
- **Animations**: Framer Motion for smooth transitions
- **Forms**: React Hook Form with Zod validation

### Backend Stack
- **Runtime**: Node.js with Express.js + TypeScript
- **Authentication**: Passport.js with local strategy
- **Database**: **TEMPORARY IN-MEMORY STORAGE** (no external database)
- **Session Management**: Memory-based session storage
- **Security**: bcrypt, rate limiting, CORS, XSS protection
- **Real-time**: Socket.io for chat and notifications
- **SMS Integration**: Twilio for OTP verification

### Key Design Principles
- **Memory Database**: Use in-memory storage for all data (no PostgreSQL)
- **Production Ready**: Complete error handling, logging, security
- **Nigerian Market Focus**: Localized features, currency (₦), phone validation
- **Mobile-First**: Responsive design for all Nigerian devices
- **Real-time Features**: Live chat, notifications, speed tests

## Branding Specifications

### Logo & Brand Identity
- **Brand Name**: "One Link Internet"
- **Logo Design**: Two interlocking chain-link shapes with 45° rotation
- **Logo Colors**: Gradient from cyan-blue (#29ABE2) to royal blue (#0052CC)
- **Typography**: 
  - "ONE LINK": Bold uppercase, dark navy (#003366)
  - "Internet": Regular weight, blue (#0052CC)
  - Letter spacing: 0.5px for readability
- **Layout**: Horizontal layout (logo beside text) in header navigation

### Color Palette
- **Primary**: Nigerian green (#008751), Blue (#0052CC) 
- **Secondary**: Cyan (#29ABE2), Navy (#003366)
- **Status**: Success green, Warning amber, Error red
- **Neutrals**: Modern gray scale with proper contrast

## Complete Feature Set

### 1. Authentication & User Management
- **Registration System**: Email/password with validation
- **Login System**: Secure authentication with session management
- **Password Security**: bcrypt hashing with salt rounds
- **Role-Based Access**: Customer, Admin, SuperAdmin roles
- **Session Management**: Memory-based session storage
- **Rate Limiting**: 5 login attempts per 15 minutes
- **Account Recovery**: Password reset via email (simulated)

### 2. Service Plans & Pricing (In-Memory Data)
Create these exact plans for Nigerian regions:

**Lagos Regional Plans:**
- Basic Home: 10 Mbps, ₦15,000/month, unlimited data
- Standard Home: 25 Mbps, ₦25,000/month, unlimited data
- Premium Home: 50 Mbps, ₦40,000/month, unlimited data
- Business Plus: 100 Mbps, ₦80,000/month, unlimited data
- Enterprise Pro: 200 Mbps, ₦150,000/month, unlimited data

**Abuja Regional Plans:**
- Basic Home: 20 Mbps, ₦20,000/month, unlimited data
- Standard Home: 30 Mbps, ₦30,000/month, unlimited data
- Premium Home: 75 Mbps, ₦45,000/month, unlimited data
- Business Plus: 120 Mbps, ₦100,000/month, unlimited data
- Enterprise Pro: 250 Mbps, ₦180,000/month, unlimited data

**Port Harcourt Regional Plans:**
- Basic Home: 15 Mbps, ₦18,000/month, unlimited data
- Standard Home: 30 Mbps, ₦30,000/month, unlimited data
- Premium Home: 60 Mbps, ₦42,000/month, unlimited data
- Business Plus: 120 Mbps, ₦95,000/month, unlimited data
- Enterprise Pro: 200 Mbps, ₦160,000/month, unlimited data

**Ilorin Regional Plans:**
- Basic Home: 10 Mbps, ₦12,000/month, unlimited data
- Standard Home: 25 Mbps, ₦22,000/month, unlimited data
- Premium Home: 40 Mbps, ₦35,000/month, unlimited data
- Business Plus: 100 Mbps, ₦75,000/month, unlimited data

## Implementation Notes

This document contains the complete specification for building a production-ready Nigerian telecom platform. The implementation will be done in phases:

1. Core authentication and user management
2. Service plans and subscription system
3. Payment integration
4. Real-time features
5. Admin panel
6. Advanced features and optimizations

See the full specification in the original prompt for complete details on all features, API routes, data models, and implementation requirements.
