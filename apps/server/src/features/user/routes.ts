import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.js'

const user = new Hono()

user.get('/me', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  return c.json(currentUser)
})

export { user }
