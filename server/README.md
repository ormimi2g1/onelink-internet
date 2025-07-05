# One Link Internet Backend

## Production Deployment

This is the backend API server for One Link Internet platform.

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Session
SESSION_SECRET="your-super-secret-session-key-here"

# CORS
ALLOWED_ORIGINS="https://your-frontend-domain.com"

# Port
PORT=5000

# Node Environment
NODE_ENV=production
```

### Deployment Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start server
npm start
```

### Health Check

- GET `/health` - Server health check
- GET `/api/health` - API health check

### Database Setup

1. Create PostgreSQL database
2. Set DATABASE_URL in environment variables
3. Run migrations: `npx prisma migrate deploy`
4. (Optional) Seed data: `npm run db:seed`
