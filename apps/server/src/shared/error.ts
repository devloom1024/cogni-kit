import { ErrorCode } from 'shared'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * 应用错误类
 * - code: ErrorCode 枚举值，同时也是 i18n key
 * - status: HTTP 状态码
 * - details: 可选的额外错误详情
 */
export class AppError extends Error {
    constructor(
        public code: ErrorCode,
        public status: ContentfulStatusCode = 500,
        public details?: Record<string, unknown>
    ) {
        super(code)  // 直接使用 ErrorCode 作为 message (i18n key)
        this.name = 'AppError'
    }
}
