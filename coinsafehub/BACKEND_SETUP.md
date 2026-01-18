# CoinSafeHub - Full Stack Setup Guide

## Project Structure

This is now a monorepo with:
- **Frontend**: Next.js app at root (`src/app/*`)
- **Backend**: Hono server at `packages/server`
- **Database**: PostgreSQL with Prisma ORM

```
coinsafehub/
├── src/                    # Next.js frontend
├── packages/
│   └── server/            # Hono backend
├── package.json           # Root workspace
└── tsconfig.json
```

## Prerequisites

- **Bun** (package manager): https://bun.sh
- **PostgreSQL**: Running locally or in Docker
- **Node.js** (optional, Bun includes it)

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb coinsafehub

# Set connection string in .env
# packages/server/.env.local
DATABASE_URL=postgresql://localhost/coinsafehub
```

#### Option B: Docker PostgreSQL

```bash
docker run --name coinsafehub-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=coinsafehub \
  -p 5432:5432 \
  -d postgres:16

# .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/coinsafehub
```

### 3. Configure Backend

```bash
cd packages/server

# Generate Prisma Client
bun run prisma:generate

# Run migrations
bun run prisma:migrate
```

### 4. Start Development

**Option A: Frontend only**
```bash
bun run dev
# http://localhost:3000
```

**Option B: Frontend + Backend**
```bash
bun run dev:all
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

**Option C: Backend only**
```bash
cd packages/server
bun run dev
# http://localhost:3001
```

## Environment Variables

### Frontend
The frontend automatically connects to `http://localhost:3001` in development.

### Backend

Create `packages/server/.env.local`:
```
DATABASE_URL=postgresql://localhost/coinsafehub
JWT_SECRET=dev-secret-key
BETTER_AUTH_SECRET=dev-better-auth-secret
NODE_ENV=development
PORT=3001
```

## Database Management

### View/Edit Data
```bash
cd packages/server
bun run prisma:studio
# Opens http://localhost:5555
```

### Create New Migration
```bash
cd packages/server
bun run prisma:migrate
# Follow prompts
```

### Reset Database (⚠️ Warning: Deletes all data)
```bash
cd packages/server
bunx prisma migrate reset
```

## Available Scripts

### Root Level
```bash
bun run dev          # Frontend dev
bun run dev:all      # Frontend + Backend
bun run build        # Frontend build
bun run build:all    # Frontend + Backend build
bun run start        # Frontend production
bun run lint         # Lint frontend
```

### Backend (from `packages/server`)
```bash
bun run dev                # Start dev server
bun run build              # Build for production
bun run prisma:generate    # Generate Prisma types
bun run prisma:migrate     # Create/apply migrations
bun run prisma:studio      # Open Prisma Studio
```

## API Endpoints

All endpoints are at `http://localhost:3001/api/*`

### Authentication
- `POST /api/auth/register` - Register new account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/logout` - Logout

### Transactions
- `POST /api/trans/deposit` - Create deposit
- `POST /api/trans/withdrawal` - Create withdrawal
- `POST /api/trans/transfer` - Transfer funds
- `GET /api/trans/transactions` - List transactions
- `GET /api/trans/account_summary` - Get account balance

### Users
- `GET /api/users/search?email=...` - Search user
- `GET /api/users/profile` - Get user profile

## Database Schema

### Users
- id, email, name, password, verified, createdAt, updatedAt

### Deposits
- id, userId, amount, paymentMethod, network, transactionHash, receipt, notes, status, reference

### Withdrawals
- id, userId, amount, withdrawalMethod, network, withdrawalAddress, status, reference

### Transfers
- id, senderId, recipientEmail, amount, note, status, reference

See `packages/server/prisma/schema.prisma` for full schema.

## Frontend Integration

The frontend has TODO comments where endpoints need to be implemented:

```bash
grep -r "TODO: Implement" src/
```

Update the empty fetch URLs in these files:
- `src/components/login-form.tsx`
- `src/components/signup-form.tsx`
- `src/app/deposit/page.tsx`
- `src/app/withdrawal/page.tsx`
- `src/app/transfer/page.tsx`
- etc.

To the actual backend URLs:
```typescript
// Instead of:
const response = await fetch('', {

// Use:
const response = await fetch('http://localhost:3001/api/auth/login', {
```

## Next Steps

1. **Implement Authentication** - Set up JWT and Better Auth in `packages/server/src/routes/auth.ts`
2. **Add Database Logic** - Implement Prisma queries in each route handler
3. **Add Validation** - Use Zod schemas that are already set up
4. **Add Error Handling** - Implement proper error responses
5. **Update Frontend URLs** - Replace empty fetch URLs with actual endpoints
6. **Add Tests** - Set up testing for backend routes

## Troubleshooting

### Port 3001 already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database connection error
```bash
# Test connection
psql $DATABASE_URL

# Reset database
cd packages/server
bunx prisma migrate reset
```

### Prisma Client not found
```bash
cd packages/server
bun run prisma:generate
```

## Support

For issues or questions, check:
- Backend errors: `packages/server` logs
- Frontend errors: Browser console
- Database issues: `bun run prisma:studio`
