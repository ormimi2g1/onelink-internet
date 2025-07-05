# 🟪 Heroku Deployment Guide - One Link Internet

## Complete deployment guide for both Frontend and Backend on Heroku

---

## 📋 Prerequisites

1. **Heroku Account**: Create free account at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Download from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Ensure your project is in a Git repository

---

## 🚀 Part 1: Deploy Backend API

### Step 1: Install Heroku CLI and Login

```bash
# Install Heroku CLI (if not already installed)
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login
```

### Step 2: Create Backend App

```bash
# Navigate to your project root
cd c:\Projects\onelinkvscode

# Create Heroku app for backend
heroku create onelink-backend-api

# Add PostgreSQL database
heroku addons:create heroku-postgresql:mini -a onelink-backend-api
```

### Step 3: Configure Backend Environment Variables

```bash
# Set environment variables for backend
heroku config:set SESSION_SECRET="your-super-secure-session-secret-change-this" -a onelink-backend-api
heroku config:set NODE_ENV="production" -a onelink-backend-api
heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api

# Verify environment variables
heroku config -a onelink-backend-api
```

### Step 4: Prepare Backend for Deployment

```bash
# Navigate to server directory
cd server

# Create a separate Git repository for backend
git init
git add .
git commit -m "Initial backend commit"

# Add Heroku remote for backend
heroku git:remote -a onelink-backend-api

# Deploy backend
git push heroku main
```

### Step 5: Setup Database

```bash
# Run database migrations
heroku run npx prisma migrate deploy -a onelink-backend-api

# Seed the database with test data
heroku run npm run db:seed -a onelink-backend-api
```

### Step 6: Test Backend

```bash
# Check if backend is running
heroku open -a onelink-backend-api

# Test health endpoint
curl https://onelink-backend-api.herokuapp.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "One Link Internet Backend is running",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "production"
}
```

---

## 🌐 Part 2: Deploy Frontend

### Step 7: Update Frontend Configuration

First, update your frontend to use the deployed backend:

```bash
# Navigate back to project root
cd ..
```

Edit `src/lib/auth.tsx` and replace:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

With:
```typescript
const API_BASE_URL = 'https://onelink-backend-api.herokuapp.com/api';
```

### Step 8: Create Frontend App

```bash
# Create Heroku app for frontend
heroku create onelink-frontend

# Set environment variables for frontend
heroku config:set NEXT_PUBLIC_API_URL="https://onelink-backend-api.herokuapp.com" -a onelink-frontend
heroku config:set NODE_ENV="production" -a onelink-frontend

# Verify environment variables
heroku config -a onelink-frontend
```

### Step 9: Deploy Frontend

```bash
# Add Heroku remote for frontend (from project root)
heroku git:remote -a onelink-frontend

# Commit the API URL changes
git add .
git commit -m "Update API URL for Heroku backend"

# Deploy frontend
git push heroku main
```

### Step 10: Update CORS Settings

Update your backend CORS settings to include the frontend URL:

```bash
# Set the frontend URL in backend environment
heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api

# Restart backend to apply changes
heroku restart -a onelink-backend-api
```

---

## 🔧 Part 3: Final Configuration

### Step 11: Test Full Application

1. **Open your frontend**: `https://onelink-frontend.herokuapp.com`
2. **Test login** with these credentials:
   ```
   Email: customer1@onelink.ng
   Password: Customer123!
   ```
3. **Check admin login**:
   ```
   Email: admin@onelink.ng
   Password: Admin123!
   ```

### Step 12: Custom Domain (Optional)

If you have a custom domain:

```bash
# Add custom domain to frontend
heroku domains:add www.onelinkinternet.com -a onelink-frontend

# Add custom domain to backend API
heroku domains:add api.onelinkinternet.com -a onelink-backend-api

# Update CORS settings
heroku config:set FRONTEND_URL="https://www.onelinkinternet.com" -a onelink-backend-api
```

---

## 📊 Monitoring and Management

### View Logs

```bash
# Backend logs
heroku logs --tail -a onelink-backend-api

# Frontend logs
heroku logs --tail -a onelink-frontend
```

### Database Management

```bash
# Connect to database
heroku pg:psql -a onelink-backend-api

# View database info
heroku pg:info -a onelink-backend-api

# Create database backup
heroku pg:backups:capture -a onelink-backend-api
```

### App Management

```bash
# Scale dynos (if needed)
heroku ps:scale web=1 -a onelink-backend-api
heroku ps:scale web=1 -a onelink-frontend

# Restart apps
heroku restart -a onelink-backend-api
heroku restart -a onelink-frontend

# View app info
heroku info -a onelink-backend-api
heroku info -a onelink-frontend
```

---

## 🎯 Quick Reference Commands

### Deployment URLs
- **Backend API**: `https://onelink-backend-api.herokuapp.com`
- **Frontend App**: `https://onelink-frontend.herokuapp.com`
- **Health Check**: `https://onelink-backend-api.herokuapp.com/health`
- **API Health**: `https://onelink-backend-api.herokuapp.com/api/health`

### Test Credentials
```bash
# Customer Login
Email: customer1@onelink.ng
Password: Customer123!

# Admin Login  
Email: admin@onelink.ng
Password: Admin123!

# Super Admin Login
Email: superadmin@onelink.ng
Password: SuperAdmin123!
```

### Common Commands
```bash
# Deploy backend updates
cd server
git add .
git commit -m "Backend updates"
git push heroku main

# Deploy frontend updates
cd ..
git add .
git commit -m "Frontend updates"  
git push heroku main
```

---

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   heroku logs --tail -a onelink-backend-api
   
   # Clear build cache
   heroku plugins:install heroku-builds
   heroku builds:cache:purge -a onelink-backend-api
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database status
   heroku pg:info -a onelink-backend-api
   
   # Reset database (WARNING: deletes all data)
   heroku pg:reset -a onelink-backend-api
   heroku run npx prisma migrate deploy -a onelink-backend-api
   heroku run npm run db:seed -a onelink-backend-api
   ```

3. **CORS Errors**:
   ```bash
   # Update frontend URL in backend
   heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api
   heroku restart -a onelink-backend-api
   ```

4. **Environment Variables**:
   ```bash
   # Check all environment variables
   heroku config -a onelink-backend-api
   heroku config -a onelink-frontend
   ```

### Debugging Steps

1. **Check app status**:
   ```bash
   heroku ps -a onelink-backend-api
   heroku ps -a onelink-frontend
   ```

2. **Test endpoints manually**:
   ```bash
   curl https://onelink-backend-api.herokuapp.com/health
   curl https://onelink-backend-api.herokuapp.com/api/health
   ```

3. **Check database connection**:
   ```bash
   heroku run node -e "console.log(process.env.DATABASE_URL)" -a onelink-backend-api
   ```

---

## 💰 Cost Information

### Free Tier Limitations
- **550-1000 dyno hours per month** (free tier)
- **Mini PostgreSQL**: 10,000 rows, 20 connections
- **Apps sleep after 30 minutes** of inactivity

### Upgrading (Optional)
```bash
# Upgrade to Hobby dynos ($7/month each)
heroku ps:type hobby -a onelink-backend-api
heroku ps:type hobby -a onelink-frontend

# Upgrade database to Basic ($9/month)
heroku addons:upgrade heroku-postgresql:basic -a onelink-backend-api
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Heroku CLI installed and logged in
- [ ] Git repository set up
- [ ] Environment variables defined
- [ ] Database schema ready

### Backend Deployment
- [ ] Heroku app created (`onelink-backend-api`)
- [ ] PostgreSQL addon added
- [ ] Environment variables set
- [ ] Code deployed to Heroku
- [ ] Database migrations run
- [ ] Database seeded with test data
- [ ] Health endpoint tested

### Frontend Deployment  
- [ ] Backend API URL updated in code
- [ ] Heroku app created (`onelink-frontend`)
- [ ] Environment variables set
- [ ] Code deployed to Heroku
- [ ] CORS settings updated in backend
- [ ] Login functionality tested

### Final Testing
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works (customer, admin, superadmin)
- [ ] Dashboard displays user data
- [ ] API endpoints responding
- [ ] Database operations working

---

**🎉 Congratulations! Your One Link Internet platform is now live on Heroku!**

Your apps will be available at:
- **Frontend**: `https://onelink-frontend.herokuapp.com`
- **Backend API**: `https://onelink-backend-api.herokuapp.com`
