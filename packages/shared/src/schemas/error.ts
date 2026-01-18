import { z } from '@hono/zod-openapi'

export const ErrorSchema = z.object({
    code: z.string().openapi({ description: 'Business error code', example: 'auth.user_not_found' }),
    message: z.string().openapi({ description: 'Developer-friendly error message', example: 'User not found' }),
    details: z.record(z.string(), z.any()).optional().openapi({ description: 'Additional error details' }),
}).openapi('Error')

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
    data: dataSchema,
    message: z.string().optional(),
}).openapi('ApiResponse')

export type ApiError = z.infer<typeof ErrorSchema>
