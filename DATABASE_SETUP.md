# PostgreSQL Database Setup Guide

## Quick Setup Options

### Option 1: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL**:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Choose version 15 or 16
   - During installation, set a password for the `postgres` user

2. **Create Database**:
   ```sql
   -- Connect to PostgreSQL as postgres user
   CREATE DATABASE onelink_db;
   CREATE USER onelink_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE onelink_db TO onelink_user;
   ```

3. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/onelink_db"
   ```

### Option 2: Cloud Database (Recommended for Production)

#### Neon (Free Tier Available)
1. Go to https://neon.tech/
2. Create account and new project
3. Copy connection string to `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/onelink_db?sslmode=require"
   ```

#### Supabase (Free Tier Available)
1. Go to https://supabase.com/
2. Create new project
3. Go to Settings > Database
4. Copy connection string to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```

#### Railway (Simple Deploy)
1. Go to https://railway.app/
2. Create new project with PostgreSQL
3. Copy connection string to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
   ```

## Database Setup Commands

After setting up PostgreSQL and updating your `.env` file:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema to database (creates tables)
npm run db:push

# 3. Seed database with sample data
npm run db:seed

# 4. Start the server
npm run dev:server
```

## Alternative: Use Prisma Dev Database (Quickest)

If you just want to test quickly without setting up PostgreSQL:

```bash
# This creates a local PostgreSQL instance managed by Prisma
npx prisma dev

# Then follow the prompts to create a database
# Your .env will be updated automatically
```

## Verify Database Setup

1. **Check API Health**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return healthy database status.

2. **Check Service Plans**:
   ```bash
   curl http://localhost:5000/api/plans
   ```
   Should return Nigerian service plans.

3. **Open Prisma Studio** (Database GUI):
   ```bash
   npm run db:studio
   ```
   Opens http://localhost:5555 with database browser.

## Sample Data Included

After seeding, you'll have:
- **20+ Service Plans** across 4 Nigerian regions
- **5 Test Users** (3 customers, 1 admin, 1 superadmin)
- **Sample Subscriptions, Usage Data, Speed Tests**
- **Support Tickets and Payment Records**

### Test Account Credentials:
- **Customer**: customer1@onelink.ng / Customer123!
- **Admin**: admin@onelink.ng / Admin123!
- **SuperAdmin**: superadmin@onelink.ng / SuperAdmin123!

## Troubleshooting

### Connection Issues:
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Ensure database exists
4. Check firewall/network settings

### Schema Issues:
```bash
# Reset database and reseed
npm run db:reset
```

### Port Conflicts:
- PostgreSQL default port: 5432
- API server port: 5000
- Prisma Studio port: 5555

## Production Considerations

1. **Security**:
   - Use strong passwords
   - Enable SSL connections
   - Set up proper user permissions

2. **Performance**:
   - Configure connection pooling
   - Set up database indices
   - Monitor query performance

3. **Backup**:
   - Regular automated backups
   - Point-in-time recovery
   - Test restore procedures

4. **Monitoring**:
   - Database health checks
   - Query performance monitoring
   - Connection pool monitoring

## Next Steps

Once your database is running:
1. Implement authentication system
2. Add user dashboard
3. Build subscription management
4. Integrate payment gateways
5. Add real-time features

The PostgreSQL database provides a solid foundation for scaling the One Link Internet platform to handle millions of users and transactions!
