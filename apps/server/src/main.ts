import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.get('/', (c) => {
  return c.json({ message: 'CogniKit API is running' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const port = Number(process.env.PORT) || 3001

console.log(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
