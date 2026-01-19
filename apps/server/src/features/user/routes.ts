import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { authMiddleware } from '../../middleware/auth.js'
import { UserSchema } from 'shared'

const user = new OpenAPIHono()

const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['User'],
  summary: '获取当前用户信息',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: '当前用户信息',
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
