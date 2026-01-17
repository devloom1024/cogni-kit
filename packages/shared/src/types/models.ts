// ==================== 枚举定义 ====================

/**
 * 用户状态枚举
 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
  DELETED: 'DELETED',
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

/**
 * 第三方登录平台枚举
 */
export const SocialProvider = {
  github: 'github',
  google: 'google',
  linuxdo: 'linuxdo',
} as const

export type SocialProvider = typeof SocialProvider[keyof typeof SocialProvider]

/**
 * 验证码类型枚举
 */
export const VerificationCodeType = {
  register: 'register',
  login: 'login',
  forgot_password: 'forgot_password',
  bind_email: 'bind_email',
  bind_phone: 'bind_phone',
} as const

export type VerificationCodeType = typeof VerificationCodeType[keyof typeof VerificationCodeType]

// ==================== 数据模型类型 ====================

/**
 * 用户数据模型
 */
export interface User {
  id: string
  username: string
  nickname: string | null
  email: string | null
  emailVerified: boolean
  phone: string | null
  phoneVerified: boolean
  avatar: string | null
  status: UserStatus
  createdAt: string // ISO 8601 字符串
  updatedAt: string // ISO 8601 字符串
}

/**
 * Token 对 (访问令牌 + 刷新令牌)
 */
export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: string // ISO 8601 字符串
}

/**
 * 第三方账号信息
 */
export interface SocialAccount {
  id: string
  userId: string
  provider: SocialProvider
  providerId: string
  providerUsername: string | null
  providerEmail: string | null
  providerAvatar: string | null
  createdAt: string
  updatedAt: string
}
