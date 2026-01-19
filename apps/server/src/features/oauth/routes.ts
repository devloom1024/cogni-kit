import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { githubOAuth } from './github.js'
import { googleOAuth } from './google.js'
import {
  SocialProvider,
  OAuthCallbackRequestSchema,
  OAuthUrlResponseSchema,
  OAuthResponseSchema,
  ErrorSchema,
  ErrorCode,
} from 'shared'
import { AppError } from '../../shared/error.js'

const oauth = new OpenAPIHono()

// --- Get Auth URL ---
const getAuthUrlRoute = createRoute({
  method: 'get',
  path: '/{provider}/url',
  tags: ['OAuth'],
  summary: '获取 OAuth 授权 URL',
  request: {
    params: z.object({
      provider: z.nativeEnum(SocialProvider).openapi({ example: SocialProvider.github })
    }),
    query: z.object({
      redirectUri: z.string().optional().openapi({ description: '授权成功后的回调地址 (可选)' })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OAuthUrlResponseSchema
        }
      },
      description: '授权 URL 获取成功'
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '不支持的 OAuth 提供商'
    },
    503: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '提供商未配置'
    }
  }
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware
oauth.openapi(getAuthUrlRoute, async (c) => {
  const provider = c.req.valid('param').provider
  const { redirectUri } = c.req.valid('query')

  let url: string

  switch (provider) {
    case SocialProvider.github:
      url = githubOAuth.getAuthUrl(redirectUri)
      break
    case SocialProvider.google:
      url = googleOAuth.getAuthUrl(redirectUri)
      break
    default:
      // Should be caught by validation but switch adds safety
      throw new AppError(ErrorCode.OAUTH_INVALID_PROVIDER, 400, { provider })
  }

  return c.json({ url })
})

// --- Handle Callback ---
const handleCallbackRoute = createRoute({
  method: 'post',
  path: '/{provider}/callback',
  tags: ['OAuth'],
  summary: 'OAuth 回调 (交换 Token)',
  request: {
    params: z.object({
      provider: z.nativeEnum(SocialProvider).openapi({ example: SocialProvider.github })
    }),
    body: {
      content: {
        'application/json': {
          schema: OAuthCallbackRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OAuthResponseSchema
        }
      },
      description: 'OAuth 登录成功'
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '授权码无效或已过期'
    },
    403: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '账号未激活'
    },
    503: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: '提供商未配置'
    }
  }
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware
oauth.openapi(handleCallbackRoute, async (c) => {
  const provider = c.req.valid('param').provider
  const { code, redirectUri } = c.req.valid('json')

  let result

  switch (provider) {
    case SocialProvider.github:
      result = await githubOAuth.handleCallback(code, redirectUri)
      break
    case SocialProvider.google:
      result = await googleOAuth.handleCallback(code, redirectUri)
      break
    default:
      throw new AppError(ErrorCode.OAUTH_INVALID_PROVIDER, 400, { provider })
  }

  // Adapt the result to match OAuthResponseSchema (User + TokenPair + isNewUser)
  // The service returns exactly this structure, so it should be fine.
  return c.json(result)
})

export { oauth }
