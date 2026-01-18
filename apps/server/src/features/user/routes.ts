import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '../../middleware/auth.js'
import { UserStatus, UserSchema } from 'shared'

const user = new OpenAPIHono()

const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['User'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'Get current user profile',
    },
  },
})

// Apply auth middleware to the /me route
user.use('/me', authMiddleware)

user.openapi(getMeRoute, async (c) => {
  const currentUser = c.get('user')
  return c.json(currentUser)
})

export { user }
