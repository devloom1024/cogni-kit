// ==================== 错误类型 ====================

/**
 * API 错误响应
 */
export interface ApiError {
  code: string // 业务错误码
  message: string // 错误信息
  details?: Record<string, unknown> // 额外信息
}

// ==================== 错误码枚举 ====================

/**
 * 统一错误码
 */
export enum ErrorCode {
  // ========== 验证相关 ==========
  VALIDATION_ERROR = 'validation_error',
  INVALID_CODE = 'auth.invalid_code',
  CODE_EXPIRED = 'auth.code_expired',
  CODE_ALREADY_USED = 'auth.code_already_used',

  // ========== 认证相关 ==========
  INVALID_CREDENTIALS = 'auth.invalid_credentials',
  USER_NOT_FOUND = 'auth.user_not_found',
  EMAIL_EXISTS = 'auth.email_exists',
  USERNAME_EXISTS = 'auth.username_exists',
  UNAUTHORIZED = 'auth.unauthorized',
  TOKEN_EXPIRED = 'auth.token_expired',
  INVALID_TOKEN = 'auth.invalid_token',
  SESSION_REVOKED = 'auth.session_revoked',

  // ========== 账号状态 ==========
  ACCOUNT_BANNED = 'auth.account_banned',
  ACCOUNT_INACTIVE = 'auth.account_inactive',
  ACCOUNT_DELETED = 'auth.account_deleted',

  // ========== 限流 ==========
  RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded',
  TOO_MANY_REQUESTS = 'rate_limit.too_many_requests',

  // ========== 系统错误 ==========
  INTERNAL_ERROR = 'internal_error',
  DATABASE_ERROR = 'database_error',
  EMAIL_SERVICE_ERROR = 'email.service_error',
}
