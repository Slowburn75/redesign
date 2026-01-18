import { Hono } from 'hono'
import prisma from '../lib/prisma'

const users = new Hono()

// TODO: Implement user search
users.get('/search', async (c) => {
  try {
    const email = c.req.query('email')

    if (!email) {
      return c.json({ error: 'Email parameter required' }, 400)
    }

    // TODO: Find user by email (without sensitive data)
    // TODO: Return user name/username for transfer

    return c.json({
      name: 'User Name',
      email: email,
    })
  } catch (error) {
    return c.json({ error: 'User not found' }, 404)
  }
})

// TODO: Implement get profile
users.get('/profile', async (c) => {
  try {
    // TODO: Get user from auth token
    // TODO: Return user profile data

    return c.json({
      id: 'user_id',
      email: 'user@example.com',
      name: 'User Name',
      verified: true,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 400)
  }
})

export default users
