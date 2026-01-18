import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma'

const auth = new Hono()

// Request validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.number(),
})

// TODO: Implement registration
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const data = registerSchema.parse(body)

    // TODO: Hash password
    // TODO: Send OTP email
    // TODO: Create user in database

    return c.json(
      {
        message: 'Check your email for verification code',
        email: data.email,
      },
      201
    )
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// TODO: Implement login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const data = loginSchema.parse(body)

    // TODO: Find user
    // TODO: Verify password
    // TODO: Generate JWT token

    return c.json({
      message: 'Login successful',
      token: 'TODO: JWT token',
      user: {
        id: 'user_id',
        email: data.email,
      },
    })
  } catch (error) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
})

// TODO: Implement email verification
auth.post('/verify-email', async (c) => {
  try {
    const body = await c.req.json()
    const data = verifyEmailSchema.parse(body)

    // TODO: Verify OTP
    // TODO: Mark user as verified
    // TODO: Generate JWT token

    return c.json({
      message: 'Email verified successfully',
      token: 'TODO: JWT token',
    })
  } catch (error) {
    return c.json({ error: 'Invalid OTP' }, 400)
  }
})

// TODO: Implement logout
auth.post('/logout', async (c) => {
  // TODO: Invalidate token

  return c.json({ message: 'Logged out successfully' })
})

export default auth
