import { z } from '@hono/zod-openapi'
import { VerificationCodeType } from '../types/index.js'
import { UserSchema } from './user.js'
import { TokenPairSchema } from './token.js'

export const passwordSchema = z
  .string()
  .min(8, 'validation.password.min')
  .max(64, 'validation.password.max')
  .regex(/[A-Z]/, 'validation.password.uppercase')
  .regex(/[a-z]/, 'validation.password.lowercase')
  .regex(/[0-9]/, 'validation.password.number')
  .openapi({ description: '密码 (8-64 位，必须包含大写字母、小写字母和数字)', example: 'Password123!' })

export const sendCodeSchema = z.object({
  target: z.string().email('validation.email.invalid').openapi({ description: '目标邮箱地址', example: 'user@example.com' }),
  type: z.nativeEnum(VerificationCodeType).openapi({ description: '验证码类型 (register: 注册, login: 登录, forgot_password: 忘记密码)', example: VerificationCodeType.register }),
}).openapi('SendCodeRequest')

export const registerSchema = z.object({
  email: z.string().email('validation.email.invalid').openapi({ description: '注册邮箱地址', example: 'user@example.com' }),
  password: passwordSchema,
  repeatPassword: z.string().openapi({ description: '确认密码 (需与 password 一致)', example: 'Password123!' }),
  code: z.string().length(6, 'validation.code.length').openapi({ description: '邮箱验证码 (6 位数字)', example: '123456' }),
}).refine(data => data.password === data.repeatPassword, {
  message: "validation.password.mismatch",
  path: ['repeatPassword'],
}).openapi('RegisterRequest')

export const loginSchema = z.object({
  account: z.string().min(1, 'validation.account.required').openapi({ description: '账号 (邮箱或用户名)', example: 'user@example.com' }),
  password: z.string().min(1, 'validation.password.required').openapi({ description: '密码', example: 'Password123!' }),
}).openapi('LoginRequest')

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'validation.refresh_token.required').openapi({ description: 'Refresh Token', example: 'refresh_token_string' }),
}).openapi('RefreshTokenRequest')

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.email.invalid').openapi({ description: '注册邮箱地址', example: 'user@example.com' }),
  code: z.string().length(6, 'validation.code.length').openapi({ description: '邮箱验证码 (6 位数字)', example: '123456' }),
  newPassword: passwordSchema,
  repeatNewPassword: z.string().openapi({ description: '确认新密码', example: 'Password123!' }),
}).refine(data => data.newPassword === data.repeatNewPassword, {
  message: "validation.password.mismatch",
  path: ['repeatNewPassword'],
}).openapi('ForgotPasswordRequest')

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'validation.auth_code.required').openapi({ description: '授权码 (Authorization Code)' }),
  redirectUri: z.string().url().optional().openapi({ description: '回调地址 (OAuth 初始化时的 redirect_uri)' }),
}).openapi('OAuthCallbackRequest')

export const oauthUrlResponseSchema = z.object({
  url: z.string().openapi({ description: '完整的授权 URL，将用户重定向到此地址进行授权', example: 'https://github.com/login/oauth/authorize?client_id=...' }),
}).openapi('OAuthUrlResponse')

export const authResponseSchema = z.object({
  user: UserSchema.openapi({ description: '用户信息' }),
  tokens: TokenPairSchema.openapi({ description: 'Token 令牌对' }),
}).openapi('AuthResponse')

export const oauthResponseSchema = z.object({
  user: UserSchema.openapi({ description: '用户信息' }),
  tokens: TokenPairSchema.openapi({ description: 'Token 令牌对' }),
  isNewUser: z.boolean().openapi({ description: '是否为新注册用户', example: false }),
}).openapi('OAuthResponse')

export const sendCodeResponseSchema = z.object({
  success: z.boolean().openapi({ description: '是否成功发送', example: true }),
  message: z.string().openapi({ description: '状态信息', example: '验证码已发送' }),
  expiresIn: z.number().int().openapi({ description: '验证码有效期 (秒)', example: 900 }),
}).openapi('SendCodeResponse')

export const successResponseSchema = z.object({
  success: z.boolean().openapi({ description: '是否成功', example: true }),
  message: z.string().optional().openapi({ description: '状态信息', example: '操作成功' }),
}).openapi('SuccessResponse')

export type SendCodeRequest = z.infer<typeof sendCodeSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>
export type OAuthCallbackRequest = z.infer<typeof oauthCallbackSchema>
export type OAuthUrlResponse = z.infer<typeof oauthUrlResponseSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type OAuthResponse = z.infer<typeof oauthResponseSchema>
export type SendCodeResponse = z.infer<typeof sendCodeResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>

export const SendCodeRequestSchema = sendCodeSchema
export const RegisterRequestSchema = registerSchema
export const LoginRequestSchema = loginSchema
export const RefreshTokenRequestSchema = refreshTokenSchema
export const ForgotPasswordRequestSchema = forgotPasswordSchema
export const OAuthCallbackRequestSchema = oauthCallbackSchema
export const OAuthUrlResponseSchema = oauthUrlResponseSchema
export const AuthResponseSchema = authResponseSchema
export const OAuthResponseSchema = oauthResponseSchema
export const SendCodeResponseSchema = sendCodeResponseSchema
export const SuccessResponseSchema = successResponseSchema
