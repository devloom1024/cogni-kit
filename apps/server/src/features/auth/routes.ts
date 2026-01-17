import { Hono } from 'hono'
import { authService } from './service.js'
import { authMiddleware } from '../../middleware/auth.js'
import { rateLimit } from '../../middleware/rate-limit.js'
import {
  sendCodeSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
} from 'shared'
import type { SendCodeResponse, SuccessResponse } from 'shared'

const auth = new Hono()

auth.post('/send-code', rateLimit({ maxRequests: 5, windowMs: 60000 }), async (c) => {
  const body = await c.req.json()
  const data = sendCodeSchema.parse(body)
  
  await authService.sendCode(data)
  
  const response: SendCodeResponse = {
    success: true,
    message: 'Verification code sent',
  }
  return c.json(response)
})

auth.post('/register', async (c) => {
  const body = await c.req.json()
  const data = registerSchema.parse(body)
  
  const result = await authService.register(data)
  
  return c.json(result, 201 as any)
})

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const data = loginSchema.parse(body)
  
  const result = await authService.login(data)
  
  return c.json(result)
})

auth.post('/refresh-token', async (c) => {
  const body = await c.req.json()
  const data = refreshTokenSchema.parse(body)
  
  const result = await authService.refreshToken(data)
  
  return c.json(result)
})

auth.post('/logout', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.substring(7) || ''
  
  await authService.logout(token)
  
  return c.body(null, 204 as any)
})

auth.post('/forgot-password', async (c) => {
  const body = await c.req.json()
  const data = forgotPasswordSchema.parse(body)
  
  await authService.resetPassword(data)
  
  const response: SuccessResponse = {
    success: true,
    message: 'Password reset successfully',
  }
  return c.json(response)
})

export { auth }
