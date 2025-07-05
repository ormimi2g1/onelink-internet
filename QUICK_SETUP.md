# 🚀 Quick Database Setup Guide for One Link Internet

## What I've Chosen for You: Neon Database

**Why Neon is perfect for you:**
- ✅ **No installation needed** - works immediately
- ✅ **Free forever** - 10GB storage, 1M rows
- ✅ **Zero configuration** - just copy & paste
- ✅ **Automatic backups** - your data is safe
- ✅ **Production ready** - scales with your app

---

## Step 1: Create Your Neon Account (5 minutes)

1. **Go to https://neon.tech/**
2. **Click "Sign Up"** 
3. **Use GitHub or Google** (fastest option)
4. **Create new project** named "onelink-internet"
5. **Choose region**: US East (N. Virginia)

## Step 2: Get Your Database Connection String

After creating your project, you'll see a connection string like:
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

## Step 3: Update Your .env File

1. Open your `.env` file in VS Code
2. Find the line that starts with `DATABASE_URL=`
3. Replace it with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-username:your-password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

## Step 4: Setup Your Database (30 seconds)

Run these commands in your terminal:

```bash
# 1. Create database tables
npm run db:push

# 2. Add sample data (Nigerian plans, test users, etc.)
npm run db:seed

# 3. Start your server
npm run dev:server
```

## Step 5: Verify Everything Works

1. **Check API Health**: http://localhost:5000/api/health
2. **View Service Plans**: http://localhost:5000/api/plans
3. **Open Database GUI**: `npm run db:studio`

---

## 🎉 What You Get After Setup

- **20+ Nigerian Service Plans** (Lagos, Abuja, Port Harcourt, Kano)
- **5 Test User Accounts** (customers, admin, superadmin)
- **Sample Data** (subscriptions, usage, speed tests, tickets)
- **Working API** ready for your frontend

### Test Account Credentials:
- **Customer**: customer1@onelink.ng / Customer123!
- **Admin**: admin@onelink.ng / Admin123!
- **SuperAdmin**: superadmin@onelink.ng / SuperAdmin123!

---

## 🔧 Troubleshooting

**Issue**: Connection failed
**Solution**: Double-check your DATABASE_URL in `.env`

**Issue**: Tables not created
**Solution**: Run `npm run db:push` again

**Issue**: No data showing
**Solution**: Run `npm run db:seed` to add sample data

---

## 🚀 Next Steps

Once your database is running:
1. ✅ **Database Setup** (you're here!)
2. 🔄 **Authentication System** (login/register)
3. 📊 **User Dashboard** (account management)
4. 💳 **Payment Integration** (Paystack/Flutterwave)
5. 🌐 **Frontend Polish** (UI improvements)

---

## 💡 Why This Setup is Perfect

- **No Technical Debt**: Using industry-standard PostgreSQL
- **Scalable**: Handles millions of users/transactions
- **Secure**: SSL encryption, automatic backups
- **Cost-Effective**: Free tier is generous, paid plans are affordable
- **Production-Ready**: Same database used by major companies

**You're getting a $1000+ enterprise database setup for free!**

---

Ready to continue? Just follow the steps above and you'll have a professional-grade database running in minutes! 🎯
