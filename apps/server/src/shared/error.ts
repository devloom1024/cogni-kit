import { ErrorCode } from 'shared'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class AppError extends Error {
    constructor(
        public code: ErrorCode,
        message: string = 'internal.error',
        public status: ContentfulStatusCode = 500,
        public details?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'AppError'
    }
}
