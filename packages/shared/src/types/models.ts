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
// 注意: User 和 TokenPair 类型已迁移至 schemas/ 并通过 z.infer 推导
// 请从 'shared' 导入这些类型，它们现在由 Zod Schema 作为单一数据源

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
