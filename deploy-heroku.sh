#!/bin/bash

# One Link Internet - Heroku Deployment Script

echo "🟪 One Link Internet - Heroku Deployment"
echo "========================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   Download from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI found"

# Login check
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku:"
    heroku login
fi

echo "✅ Heroku authentication confirmed"

# Backend deployment
echo ""
echo "🚀 Deploying Backend..."
echo "----------------------"

# Create backend app
echo "📱 Creating backend Heroku app..."
heroku create onelink-backend-api

# Add PostgreSQL
echo "🐘 Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini -a onelink-backend-api

# Set environment variables
echo "⚙️  Setting environment variables..."
heroku config:set SESSION_SECRET="$(openssl rand -base64 32)" -a onelink-backend-api
heroku config:set NODE_ENV="production" -a onelink-backend-api
heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api

# Deploy backend
echo "📦 Deploying backend code..."
cd server
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a onelink-backend-api
git push heroku main

# Setup database
echo "🏗️  Setting up database..."
heroku run npx prisma migrate deploy -a onelink-backend-api
heroku run npm run db:seed -a onelink-backend-api

cd ..

# Frontend deployment
echo ""
echo "🌐 Deploying Frontend..."
echo "------------------------"

# Create frontend app
echo "📱 Creating frontend Heroku app..."
heroku create onelink-frontend

# Set environment variables
echo "⚙️  Setting frontend environment variables..."
heroku config:set NEXT_PUBLIC_API_URL="https://onelink-backend-api.herokuapp.com" -a onelink-frontend
heroku config:set NODE_ENV="production" -a onelink-frontend

# Deploy frontend
echo "📦 Deploying frontend code..."
heroku git:remote -a onelink-frontend
git add .
git commit -m "Frontend deployment with Heroku backend"
git push heroku main

# Final configuration
echo ""
echo "🔧 Final Configuration..."
echo "------------------------"

# Update CORS
echo "🔗 Updating CORS settings..."
heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api
heroku restart -a onelink-backend-api

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Your applications are now live:"
echo "📱 Frontend:  https://onelink-frontend.herokuapp.com"
echo "🔧 Backend:   https://onelink-backend-api.herokuapp.com"
echo "🏥 Health:    https://onelink-backend-api.herokuapp.com/health"
echo ""
echo "Test Credentials:"
echo "📧 Customer: customer1@onelink.ng / Customer123!"
echo "👨‍💼 Admin:    admin@onelink.ng / Admin123!"
echo ""
echo "Happy coding! 🚀"
