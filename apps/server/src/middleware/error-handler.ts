import type { Context, Next } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ApiError } from 'shared'
import { ZodError } from 'zod'
import { logger } from '../shared/logger.js'
import { t } from '../shared/i18n/index.js'
import { ErrorCode } from 'shared'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()
  } catch (error) {
    if (error instanceof ZodError) {
      const apiError: ApiError = {
        code: ErrorCode.VALIDATION_ERROR,
        message: t('validation.error'),
        details: {
          errors: error.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      }
      return c.json(apiError, 400)
    }

    if (error instanceof Error) {
      logger.error({ error: error.message, stack: error.stack }, 'Request error')

      const errorMap: Record<string, { code: ErrorCode; status: number }> = {
        'Invalid or expired token': { code: ErrorCode.INVALID_TOKEN, status: 401 },
        'Session revoked': { code: ErrorCode.SESSION_REVOKED, status: 401 },
        'User not found': { code: ErrorCode.USER_NOT_FOUND, status: 404 },
        'Invalid credentials': { code: ErrorCode.INVALID_CREDENTIALS, status: 401 },
        'Email already exists': { code: ErrorCode.EMAIL_EXISTS, status: 409 },
        'Email service error': { code: ErrorCode.EMAIL_SERVICE_ERROR, status: 500 },
      }

      const mapped = errorMap[error.message]
      if (mapped) {
        const apiError: ApiError = {
          code: mapped.code,
          message: error.message,
        }
        return c.json(apiError, mapped.status as ContentfulStatusCode)
      }
    }

    const apiError: ApiError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: t('internal.error'),
    }
    return c.json(apiError, 500)
  }
}
