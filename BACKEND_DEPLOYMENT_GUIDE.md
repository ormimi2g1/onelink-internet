# 🚀 Backend Deployment Guide

## One Link Internet Backend Deployment

This guide will help you deploy your backend API to Railway, Render, or Heroku.

---

## 🛤️ Option 1: Railway (Recommended)

### Step 1: Prepare Your Backend

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Test build locally**:
   ```bash
   npm run build
   ```

### Step 2: Deploy to Railway

1. **Create Railway account**: Go to [railway.app](https://railway.app) and sign up

2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

3. **Login to Railway**:
   ```bash
   railway login
   ```

4. **Initialize Railway project**:
   ```bash
   railway init
   ```

5. **Add PostgreSQL database**:
   ```bash
   railway add postgresql
   ```

6. **Set environment variables**:
   ```bash
   railway variables set SESSION_SECRET="your-super-secure-session-secret-here"
   railway variables set NODE_ENV="production"
   railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"
   ```

7. **Deploy**:
   ```bash
   railway up
   ```

### Step 3: Database Setup

1. **Get DATABASE_URL**:
   ```bash
   railway variables
   ```

2. **Run database migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

3. **Seed database** (optional):
   ```bash
   railway run npm run db:seed
   ```

---

## 🎨 Option 2: Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Deploy Backend

1. **Create new Web Service**
2. **Connect your GitHub repository**
3. **Configure deployment**:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### Step 3: Add Database

1. **Create PostgreSQL database** on Render
2. **Copy DATABASE_URL** from database dashboard

### Step 4: Set Environment Variables

In your Render web service settings, add:
```
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-super-secure-session-secret
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 5: Deploy

Click "Manual Deploy" or push to your main branch

---

## 🟪 Option 3: Heroku

### Step 1: Install Heroku CLI

Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

### Step 2: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create app
heroku create onelink-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini
```

### Step 3: Configure Environment Variables

```bash
heroku config:set SESSION_SECRET="your-super-secure-session-secret"
heroku config:set NODE_ENV="production"
heroku config:set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

### Step 4: Deploy

```bash
# Add Heroku remote
heroku git:remote -a onelink-backend

# Deploy
git push heroku main
```

---

## 🔧 Update Frontend to Use Deployed Backend

### Step 1: Update Auth Service

Edit `src/lib/auth.tsx`:

```typescript
// Replace this line:
const API_BASE_URL = 'http://localhost:5000/api';

// With your deployed backend URL:
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
// or
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
// or  
const API_BASE_URL = 'https://your-backend-url.herokuapp.com/api';
```

### Step 2: Update CORS Settings

Update your backend's allowed origins to include your Vercel URL:

```typescript
// In server/index.ts
const allowedOrigins = [
  'https://your-vercel-app.vercel.app',
  'https://your-custom-domain.com'
];
```

### Step 3: Deploy Frontend

```bash
# Commit changes
git add .
git commit -m "Connect to deployed backend"
git push
```

---

## 📋 Environment Variables Checklist

### Backend (.env)
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
SESSION_SECRET="your-super-secure-session-secret"
NODE_ENV="production"
FRONTEND_URL="https://your-vercel-app.vercel.app"
PORT=5000
```

### Frontend (Vercel)
```bash
# Add these to your Vercel project settings
NEXT_PUBLIC_API_URL="https://your-backend-url.railway.app"
```

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health

Visit: `https://your-backend-url.railway.app/health`

You should see:
```json
{
  "success": true,
  "message": "One Link Internet Backend is running",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Test API Endpoints

Visit: `https://your-backend-url.railway.app/api/health`

### 3. Test Frontend Login

1. Go to your Vercel app
2. Try logging in with: `customer1@onelink.ng` / `Customer123!`
3. Should work without "Failed to fetch" error

---

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check DATABASE_URL is correct
   - Ensure database is running
   - Run migrations: `npx prisma migrate deploy`

2. **CORS Errors**:
   - Check frontend URL is in allowedOrigins
   - Ensure credentials: true in CORS config

3. **Build Failures**:
   - Check all dependencies are in package.json
   - Ensure TypeScript compiles: `npm run build`

4. **Environment Variables**:
   - Double-check all required variables are set
   - Restart service after adding variables

---

## 📞 Support

If you encounter issues:

1. Check service logs in Railway/Render/Heroku dashboard
2. Test endpoints with Postman/curl
3. Verify database connection
4. Check environment variables

---

## 🎯 Quick Commands Reference

### Railway
```bash
# View logs
railway logs

# Connect to database
railway connect

# View variables
railway variables

# Deploy
railway up
```

### Render
```bash
# View logs in dashboard
# Deploy via Git push or manual deploy
```

### Heroku
```bash
# View logs
heroku logs --tail

# Connect to database
heroku pg:psql

# View config
heroku config

# Deploy
git push heroku main
```

---

**🚀 You're ready to deploy! Choose your preferred platform and follow the steps above.**
