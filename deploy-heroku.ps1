# One Link Internet - Heroku Deployment Script (PowerShell)

Write-Host "🟪 One Link Internet - Heroku Deployment" -ForegroundColor Magenta
Write-Host "========================================"

# Check if Heroku CLI is installed
try {
    heroku --version | Out-Null
    Write-Host "✅ Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Download from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
}

# Login check
try {
    heroku auth:whoami | Out-Null
    Write-Host "✅ Heroku authentication confirmed" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Heroku:" -ForegroundColor Yellow
    heroku login
}

# Backend deployment
Write-Host ""
Write-Host "🚀 Deploying Backend..." -ForegroundColor Cyan
Write-Host "----------------------"

# Create backend app
Write-Host "📱 Creating backend Heroku app..."
heroku create onelink-backend-api

# Add PostgreSQL
Write-Host "🐘 Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini -a onelink-backend-api

# Generate session secret
$sessionSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Set environment variables
Write-Host "⚙️  Setting environment variables..."
heroku config:set SESSION_SECRET="$sessionSecret" -a onelink-backend-api
heroku config:set NODE_ENV="production" -a onelink-backend-api
heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api

# Deploy backend
Write-Host "📦 Deploying backend code..."
Set-Location server
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a onelink-backend-api
git push heroku main

# Setup database
Write-Host "🏗️  Setting up database..."
heroku run npx prisma migrate deploy -a onelink-backend-api
heroku run npm run db:seed -a onelink-backend-api

Set-Location ..

# Frontend deployment
Write-Host ""
Write-Host "🌐 Deploying Frontend..." -ForegroundColor Cyan
Write-Host "------------------------"

# Create frontend app
Write-Host "📱 Creating frontend Heroku app..."
heroku create onelink-frontend

# Set environment variables
Write-Host "⚙️  Setting frontend environment variables..."
heroku config:set NEXT_PUBLIC_API_URL="https://onelink-backend-api.herokuapp.com" -a onelink-frontend
heroku config:set NODE_ENV="production" -a onelink-frontend

# Deploy frontend
Write-Host "📦 Deploying frontend code..."
heroku git:remote -a onelink-frontend
git add .
git commit -m "Frontend deployment with Heroku backend"
git push heroku main

# Final configuration
Write-Host ""
Write-Host "🔧 Final Configuration..." -ForegroundColor Cyan
Write-Host "------------------------"

# Update CORS
Write-Host "🔗 Updating CORS settings..."
heroku config:set FRONTEND_URL="https://onelink-frontend.herokuapp.com" -a onelink-backend-api
heroku restart -a onelink-backend-api

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "======================"
Write-Host ""
Write-Host "Your applications are now live:"
Write-Host "📱 Frontend:  https://onelink-frontend.herokuapp.com" -ForegroundColor Cyan
Write-Host "🔧 Backend:   https://onelink-backend-api.herokuapp.com" -ForegroundColor Cyan
Write-Host "🏥 Health:    https://onelink-backend-api.herokuapp.com/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Credentials:"
Write-Host "📧 Customer: customer1@onelink.ng / Customer123!" -ForegroundColor Yellow
Write-Host "👨‍💼 Admin:    admin@onelink.ng / Admin123!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
