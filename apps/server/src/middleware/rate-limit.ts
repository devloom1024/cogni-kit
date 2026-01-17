import type { Context, Next } from 'hono'
import { redis } from '../shared/redis.js'
import { ErrorCode } from 'shared'
import type { ApiError } from 'shared'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
}

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests } = { ...DEFAULT_CONFIG, ...config }

  return async function rateLimitMiddleware(c: Context, next: Next) {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const path = new URL(c.req.url).pathname
    const key = `rate_limit:${ip}:${path}`

    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.pexpire(key, windowMs)
    }

    if (current > maxRequests) {
      const apiError: ApiError = {
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests, please try again later',
      }
      return c.json(apiError, 429)
    }

    c.header('X-RateLimit-Limit', maxRequests.toString())
    c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - current).toString())

    await next()
  }
}
