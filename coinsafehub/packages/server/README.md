# Backend Server

Hono-based backend for CoinSafeHub with authentication, deposits, withdrawals, and transfers.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Set up database:
```bash
bun run prisma:generate
bun run prisma:migrate
```

4. Start development server:
```bash
bun run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/logout` - Logout

### Transactions
- `POST /api/trans/deposit` - Submit deposit
- `POST /api/trans/withdrawal` - Submit withdrawal
- `POST /api/trans/transfer` - Transfer to another user
- `GET /api/trans/transactions` - Get transaction history
- `GET /api/trans/account_summary` - Get account summary

### Users
- `GET /api/users/search` - Search user by email
- `GET /api/users/profile` - Get user profile
