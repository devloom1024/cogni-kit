import type { User, TokenPair } from './models.js'

/**
 * 认证响应 (注册/登录)
 */
export interface AuthResponse {
  user: User
  tokens: TokenPair
}

/**
 * OAuth 响应
 */
export interface OAuthResponse extends AuthResponse {
  isNewUser: boolean // 是否为新注册用户
}

/**
 * 发送验证码响应
 */
export interface SendCodeResponse {
  success: boolean
  message: string
}

/**
 * 通用成功响应
 */
export interface SuccessResponse {
  success: boolean
  message?: string
}
