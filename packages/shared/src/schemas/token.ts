import { z } from '@hono/zod-openapi'

export const TokenPairSchema = z.object({
    accessToken: z.string().openapi({ description: 'JWT Access Token (短期有效，约 1 小时)' }),
    refreshToken: z.string().openapi({ description: 'Refresh Token (长期有效，用于刷新 Access Token)' }),
    expiresAt: z.string().datetime().openapi({ description: 'Access Token 过期时间 (UTC)' }),
}).openapi('TokenPair')

export type TokenPair = z.infer<typeof TokenPairSchema>
