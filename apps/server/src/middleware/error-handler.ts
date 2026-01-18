import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ApiError } from 'shared'
import { ZodError } from 'zod'
import { logger } from '../shared/logger.js'
import { t } from '../shared/i18n/index.js'
import { ErrorCode } from 'shared'
import { AppError } from '../shared/error.js'

export function errorHandler(error: Error, c: Context) {
  console.log('[ErrorHandler] ===== onError handler called =====')
  console.log('[ErrorHandler] Error:', error)

  try {
    // Get t from context (injected by i18nMiddleware), fallback to global t
    const tLocal = c.get('t') || t

    if (error instanceof ZodError) {
      const apiError: ApiError = {
        code: ErrorCode.VALIDATION_ERROR,
        message: tLocal('validation.error'),
        details: {
          errors: error.issues.map((e) => ({
            path: e.path.join('.'),
            message: tLocal(e.message),
          })),
        },
      }
      return c.json(apiError, 400)
    }

    if (error instanceof AppError) {
      console.log('[ErrorHandler] AppError detected, status:', error.status)
      const apiError: ApiError = {
        code: error.code,
        message: tLocal(error.message),
        details: error.details
      }
      return c.json(apiError, error.status)
    }

    // Generic Error handling
    logger.error({ error: error.message, stack: error.stack }, 'Request error')

    // Legacy error map support (can be removed later if all converted to AppError)
    const errorMap: Record<string, { code: ErrorCode; status: number; key: string }> = {
      'Invalid or expired token': { code: ErrorCode.INVALID_TOKEN, status: 401, key: 'auth.invalid_token' },
      'Session revoked': { code: ErrorCode.SESSION_REVOKED, status: 401, key: 'auth.session_revoked' },
      'User not found': { code: ErrorCode.USER_NOT_FOUND, status: 404, key: 'auth.user_not_found' },
      'Invalid credentials': { code: ErrorCode.INVALID_CREDENTIALS, status: 401, key: 'auth.invalid_credentials' },
      'Email already exists': { code: ErrorCode.EMAIL_EXISTS, status: 409, key: 'auth.email_exists' },
      'Email service error': { code: ErrorCode.EMAIL_SERVICE_ERROR, status: 500, key: 'email.service_error' },
    }

    const mapped = errorMap[error.message]
    if (mapped) {
      const apiError: ApiError = {
        code: mapped.code,
        message: tLocal(mapped.key),
      }
      return c.json(apiError, mapped.status as ContentfulStatusCode)
    }

    // Default error response
    const apiError: ApiError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: tLocal('internal.error'),
    }
    return c.json(apiError, 500)
  } catch (handlerError) {
    console.error('[ErrorHandler] CRITICAL ERROR IN HANDLER:', handlerError)
    return c.text('Internal Server Error (Handler Crash)', 500)
  }
}
