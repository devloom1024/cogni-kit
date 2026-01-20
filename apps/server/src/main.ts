import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { i18nMiddleware } from './middleware/i18n.js'
import { auth } from './features/auth/routes.js'
import { oauth } from './features/oauth/routes.js'
import { user } from './features/user/routes.js'
import { logger } from './shared/logger.js'

const app = new OpenAPIHono()

app.use('*', honoLogger())
app.use(
  '*',
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
)

// Register i18n middleware
app.use('*', i18nMiddleware)
// Register error handler using Hono's onError
app.onError(errorHandler)

app.get('/', (c) => {
  return c.json({ message: 'CogniKit API is running' })
})

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'ok' }),
            timestamp: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
          }),
        },
      },
      description: 'Health check endpoint',
    },
  },
})

app.openapi(healthRoute, (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/v1/auth', auth)
app.route('/api/v1/auth', oauth)
app.route('/api/v1/users', user)

// OpenAPI documentation - 仅在非生产环境启用
if (env.NODE_ENV !== 'production') {
  app.doc('/api-docs/openapi.json', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: '认证 API',
      description: '提供用户注册、登录、个人信息管理等功能',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: '本地开发服务器',
      },
      {
        url: 'https://api.cognikit.com/auth',
        description: '生产环境服务器',
      },
    ],
    // @ts-expect-error: components is valid at runtime but missing in type definition
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token 认证，通过 Authorization: Bearer <token> 传递',
        },
      },
    },
  })

  // Swagger UI
  app.get('/api-docs', swaggerUI({ url: '/api-docs/openapi.json' }))
  
  logger.info('📚 API Documentation enabled at /api-docs')
} else {
  // 生产环境返回 404
  app.get('/api-docs', (c) => c.notFound())
  app.get('/api-docs/openapi.json', (c) => c.notFound())
}

const port = Number(env.PORT)

logger.info(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
