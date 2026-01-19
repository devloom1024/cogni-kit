import { z } from '@hono/zod-openapi'

export const ErrorSchema = z.object({
    code: z.string().openapi({ description: '业务错误码 (如 "auth.user_not_found", "auth.invalid_token")' }),
    message: z.string().openapi({ description: '错误描述 (开发者可读的调试信息)' }),
    details: z.record(z.string(), z.any()).optional().openapi({ description: '额外的错误详情 (如表单字段验证错误)' }),
}).openapi('Error')

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
    data: dataSchema,
    message: z.string().optional(),
}).openapi('ApiResponse')

export type ApiError = z.infer<typeof ErrorSchema>
