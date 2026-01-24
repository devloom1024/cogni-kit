// ==================== 错误类型 ====================
// ApiError is now defined in schemas/error.ts via z.infer

// ==================== 错误码枚举 ====================

/**
 * 统一错误码
 */
export const ErrorCode = {
  // ========== 验证相关 ==========
  VALIDATION_ERROR: 'validation_error',
  INVALID_CODE: 'auth.invalid_code',
  CODE_EXPIRED: 'auth.code_expired',
  CODE_ALREADY_USED: 'auth.code_already_used',

  // ========== 认证相关 ==========
  INVALID_CREDENTIALS: 'auth.invalid_credentials',
  USER_NOT_FOUND: 'auth.user_not_found',
  EMAIL_EXISTS: 'auth.email_exists',
  USERNAME_EXISTS: 'auth.username_exists',
  UNAUTHORIZED: 'auth.unauthorized',
  TOKEN_EXPIRED: 'auth.token_expired',
  INVALID_TOKEN: 'auth.invalid_token',
  SESSION_REVOKED: 'auth.session_revoked',

  // ========== 账号状态 ==========
  ACCOUNT_BANNED: 'auth.account_banned',
  ACCOUNT_INACTIVE: 'auth.account_inactive',
  ACCOUNT_DELETED: 'auth.account_deleted',

  // ========== OAuth 相关 ==========
  OAUTH_INVALID_PROVIDER: 'oauth.invalid_provider',
  OAUTH_NOT_CONFIGURED: 'oauth.not_configured',

  // ========== 自选相关 ==========
  WATCHLIST_FORBIDDEN: 'watchlist.forbidden',       // 无权访问该自选分组
  WATCHLIST_GROUP_NOT_FOUND: 'watchlist.group_not_found', // 分组不存在
  WATCHLIST_ITEM_NOT_FOUND: 'watchlist.item_not_found',   // 标的记录不存在
  WATCHLIST_ASSET_NOT_FOUND: 'watchlist.asset_not_found', // 标的资产不存在
  WATCHLIST_ITEM_EXISTS: 'watchlist.item_exists',         // 标的已存在

  // ========== 限流 ==========
  RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
  TOO_MANY_REQUESTS: 'rate_limit.too_many_requests',

  // ========== 系统错误 ==========
  INTERNAL_ERROR: 'internal_error',
  DATABASE_ERROR: 'database_error',
  EMAIL_SERVICE_ERROR: 'email.service_error',
} as const

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode]

// ==================== 成功消息码枚举 ====================

/**
 * 统一成功消息码
 */
export const SuccessCode = {
  // ========== 认证相关 ==========
  CODE_SENT: 'auth.code_sent',
  REGISTER_SUCCESS: 'auth.register_success',
  LOGIN_SUCCESS: 'auth.login_success',
  LOGOUT_SUCCESS: 'auth.logout_success',
  PASSWORD_RESET_SUCCESS: 'auth.password_reset_success',
  TOKEN_REFRESHED: 'auth.token_refreshed',

  // ========== OAuth 相关 ==========
  OAUTH_SUCCESS: 'oauth.success',

  // ========== 通用 ==========
  OPERATION_SUCCESS: 'common.operation_success',
  UPDATE_SUCCESS: 'common.update_success',
  DELETE_SUCCESS: 'common.delete_success',
  CREATE_SUCCESS: 'common.create_success',
} as const

export type SuccessCode = typeof SuccessCode[keyof typeof SuccessCode]
