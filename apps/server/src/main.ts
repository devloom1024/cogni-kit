import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { auth } from './features/auth/routes.js'
import { oauth } from './features/oauth/routes.js'
import { user } from './features/user/routes.js'
import { logger } from './shared/logger.js'

const app = new Hono()

app.use('*', honoLogger())
app.use('*', cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))

app.use('*', errorHandler)

app.get('/', (c) => {
  return c.json({ message: 'CogniKit API is running' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/auth', auth)
app.route('/auth', oauth)
app.route('/users', user)

const port = Number(env.PORT)

logger.info(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
