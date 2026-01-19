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
            message: z.string().openapi({ example: 'Verification code sent' }),
            expiresIn: z.number().int().openapi({ description: 'Verification code expiration time in seconds', example: 900 })
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
  const data = c.req.valid('json')
  await authService.sendCode(data)
  return c.json({ success: true, message: 'Verification code sent', expiresIn: 900 }, 200)
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
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Invalid credentials'
    },
    403: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Account banned or inactive'
    }
  }
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware  
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
  const currentUser = c.get('user')
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
