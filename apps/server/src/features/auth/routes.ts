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
  ErrorSchema,
  SendCodeResponseSchema,
  AuthResponseSchema,
  SuccessResponseSchema,
  SuccessCode,
} from 'shared'

const auth = new OpenAPIHono()

// --- Send Code ---
const sendCodeRoute = createRoute({
  method: 'post',
  path: '/send-code',
  tags: ['Auth'],
  summary: '发送验证码',
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
          schema: SendCodeResponseSchema
        }
      },
      description: '验证码发送成功'
    },
    429: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '请求过于频繁'
    }
  }
})

auth.openapi(sendCodeRoute, async (c) => {
  const data = c.req.valid('json')
  await authService.sendCode(data)
  const t = c.get('t')
  return c.json({
    success: true,
    message: t(SuccessCode.CODE_SENT),
    expiresIn: 900
  }, 200)
})

// --- Register ---
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  summary: '用户注册',
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
          schema: AuthResponseSchema
        }
      },
      description: '注册成功'
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '请求参数错误或验证码错误'
    },
    409: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '邮箱已存在'
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
  summary: '用户登录',
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
          schema: AuthResponseSchema
        }
      },
      description: '登录成功'
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '账号或密码错误'
    },
    403: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '账号未激活或被封禁'
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
  summary: '刷新 Access Token',
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
      description: 'Token 刷新成功'
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
  summary: '退出登录',
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: '退出登录成功'
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
  summary: '通过邮箱验证码重置密码',
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
          schema: SuccessResponseSchema
        }
      },
      description: '密码重置成功'
    }
  }
})

auth.openapi(forgotPasswordRoute, async (c) => {
  const data = c.req.valid('json')
  await authService.resetPassword(data)
  const t = c.get('t')
  return c.json({
    success: true,
    message: t(SuccessCode.PASSWORD_RESET_SUCCESS)
  })
})

// Apply middlewares
// Note: handling rate limit specific to send-code is tricky with just createsRoute
// We can apply it to the specific path
auth.use('/send-code', rateLimit({ maxRequests: 5, windowMs: 60000 }))
auth.use('/logout', authMiddleware)

export { auth }
