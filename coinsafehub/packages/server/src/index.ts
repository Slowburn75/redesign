import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'
import userRoutes from './routes/users'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
)

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/trans', transactionRoutes)
app.route('/api/users', userRoutes)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Root
app.get('/', (c) => {
  return c.json({
    message: 'CoinSafeHub API',
    version: '0.1.0',
    docs: 'See README.md for documentation',
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

export default app
