import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
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

user.openapi(getMeRoute, async (c) => {
  const currentUser = c.get('user')
  return c.json(currentUser)
})

export { user }
