import { z } from '@hono/zod-openapi'

export const TokenPairSchema = z.object({
    accessToken: z.string().openapi({ description: 'JWT Access Token' }),
    refreshToken: z.string().openapi({ description: 'Refresh Token' }),
    expiresAt: z.string().datetime().openapi({ description: 'Access Token expiration time' }),
}).openapi('TokenPair')

export type TokenPair = z.infer<typeof TokenPairSchema>
