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

app.route('/auth', auth)
app.route('/auth', oauth)
app.route('/users', user)

// OpenAPI documentation
// OpenAPI documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'CogniKit API',
  },
  // @ts-expect-error: components is valid at runtime but missing in type definition
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
})

// Swagger UI
app.get('/swagger', swaggerUI({ url: '/doc' }))

const port = Number(env.PORT)

logger.info(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
