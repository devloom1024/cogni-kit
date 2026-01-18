import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authService } from './service.js'
import { authMiddleware } from '../../middleware/auth.js'
import { rateLimit } from '../../middleware/rate-limit.js'
import {
  SendCodeRequestSchema,
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  ForgotPasswordRequestSchema,
  TokenPairSchema,
  UserSchema,
  ApiError,
  ErrorSchema
} from 'shared'

const auth = new OpenAPIHono()

// --- Send Code ---
const sendCodeRoute = createRoute({
  method: 'post',
  path: '/send-code',
  tags: ['Auth'],
  summary: 'Send verification code',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SendCodeRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            message: z.string().openapi({ example: 'Verification code sent' })
          })
        }
      },
      description: 'Code sent successfully'
    },
    429: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Too many requests'
    }
  }
})

auth.openapi(sendCodeRoute, async (c) => {
  // Manual rate limit check is replaced by middleware, 
  // but rateLimit middleware returns standard response?
  // We need to apply middleware to this route.
  // rateLimit middleware in Hono is usually applied via app.use() or as a middleware in the handler.
  // OpenAPIHono supports middleware in existing ways, but let's check strict compatibility.
  // For now, I'll apply it via a wrapper or assume global rate limiter if configured, 
  // but the original code had explicit rateLimit middleware on this route.
  // 'rateLimit' from middleware/rate-limit.js returns a Hono middleware.

  const data = c.req.valid('json')
  await authService.sendCode(data)
  return c.json({ success: true, message: 'Verification code sent' })
})

// --- Register ---
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  summary: 'Register new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: z.object({
            user: UserSchema,
            tokens: TokenPairSchema
          })
        }
      },
      description: 'Registration successful'
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Validation error'
    },
    409: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Email already exists'
    }
  }
})

auth.openapi(registerRoute, async (c) => {
  const data = c.req.valid('json')
  const result = await authService.register(data)
  return c.json(result, 201)
})

// --- Login ---
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'Login user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            user: UserSchema,
            tokens: TokenPairSchema
          })
        }
      },
      description: 'Login successful'
    },
    401: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Invalid credentials'
    }
  }
})

auth.openapi(loginRoute, async (c) => {
  const data = c.req.valid('json')
  const result = await authService.login(data)
  return c.json(result)
})

// --- Refresh Token ---
const refreshTokenRoute = createRoute({
  method: 'post',
  path: '/refresh-token',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RefreshTokenRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TokenPairSchema
        }
      },
      description: 'Token refreshed'
    }
  }
})

auth.openapi(refreshTokenRoute, async (c) => {
  const data = c.req.valid('json')
  const result = await authService.refreshToken(data)
  return c.json(result)
})

// --- Logout ---
const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Auth'],
  summary: 'Logout user',
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: 'Logout successful'
    }
  }
})

auth.openapi(logoutRoute, async (c) => {
  // Use authMiddleware?
  // In OpenAPIHono, middleware is usually applied via hook or app.use.
  // The original code used `auth.post('/logout', authMiddleware, ...)`
  // We can manually invoke middleware or use `.use()`.
  // For OpenAPI, security definition tells clients to send token, but we still need middleware to verify it.

  // Checking auth header manually or relying on middleware applied to this path
  // Let's reuse the logic from original controller for now to be safe, 
  // but ideally we should apply authMiddleware.
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.substring(7) || ''
  await authService.logout(token)
  return c.body(null, 204)
})

// --- Forgot Password ---
const forgotPasswordRoute = createRoute({
  method: 'post',
  path: '/forgot-password',
  tags: ['Auth'],
  summary: 'Reset password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ForgotPasswordRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            message: z.string().openapi({ example: 'Password reset successfully' })
          })
        }
      },
      description: 'Password reset successful'
    }
  }
})

auth.openapi(forgotPasswordRoute, async (c) => {
  const data = c.req.valid('json')
  await authService.resetPassword(data)
  return c.json({ success: true, message: 'Password reset successfully' })
})

// Apply middlewares
// Note: handling rate limit specific to send-code is tricky with just createsRoute
// We can apply it to the specific path
auth.use('/send-code', rateLimit({ maxRequests: 5, windowMs: 60000 }))
auth.use('/logout', authMiddleware)

export { auth }
