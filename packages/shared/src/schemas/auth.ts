import { z } from '@hono/zod-openapi'
import { VerificationCodeType } from '../types/index.js'
import { UserSchema } from './user.js'
import { TokenPairSchema } from './token.js'

export const passwordSchema = z
  .string()
  .min(8, 'validation.password.min')
  .max(128, 'validation.password.max')
  .regex(/[A-Z]/, 'validation.password.uppercase')
  .regex(/[a-z]/, 'validation.password.lowercase')
  .regex(/[0-9]/, 'validation.password.number')
  .openapi({ example: 'Password123!' })

export const sendCodeSchema = z.object({
  target: z.string().email('validation.email.invalid').openapi({ description: 'Email address', example: 'user@example.com' }),
  type: z.nativeEnum(VerificationCodeType).openapi({ example: VerificationCodeType.register }),
}).openapi('SendCodeRequest')

export const registerSchema = z.object({
  email: z.string().email('validation.email.invalid').openapi({ example: 'user@example.com' }),
  password: passwordSchema,
  repeatPassword: z.string().openapi({ example: 'Password123!' }),
  code: z.string().length(6, 'validation.code.length').openapi({ description: 'Email verification code', example: '123456' }),
}).refine(data => data.password === data.repeatPassword, {
  message: "validation.password.mismatch",
  path: ['repeatPassword'],
}).openapi('RegisterRequest')

export const loginSchema = z.object({
  account: z.string().min(1, 'validation.account.required').openapi({ description: 'Email or Username', example: 'user@example.com' }),
  password: z.string().min(1, 'validation.password.required').openapi({ example: 'Password123!' }),
}).openapi('LoginRequest')

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'validation.refresh_token.required').openapi({ example: 'refresh_token_string' }),
}).openapi('RefreshTokenRequest')

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.email.invalid').openapi({ example: 'user@example.com' }),
  code: z.string().length(6, 'validation.code.length').openapi({ example: '123456' }),
  newPassword: passwordSchema,
  repeatNewPassword: z.string().openapi({ example: 'Password123!' }),
}).refine(data => data.newPassword === data.repeatNewPassword, {
  message: "validation.password.mismatch",
  path: ['repeatNewPassword'],
}).openapi('ForgotPasswordRequest')

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'validation.auth_code.required').openapi({ description: 'Authorization code from provider' }),
  redirectUri: z.string().url().optional().openapi({ description: 'Original redirect URI' }),
}).openapi('OAuthCallbackRequest')

export const oauthUrlResponseSchema = z.object({
  url: z.string().openapi({ description: 'OAuth authorization URL', example: 'https://github.com/login/oauth/authorize?client_id=...' }),
}).openapi('OAuthUrlResponse')

export const authResponseSchema = z.object({
  user: UserSchema,
  tokens: TokenPairSchema,
}).openapi('AuthResponse')

export const oauthResponseSchema = z.object({
  user: UserSchema,
  tokens: TokenPairSchema,
  isNewUser: z.boolean().openapi({ description: 'Whether the user is newly registered', example: false }),
}).openapi('OAuthResponse')

export const sendCodeResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: 'Verification code sent' }),
}).openapi('SendCodeResponse')

export const successResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().optional().openapi({ example: 'Operation completed successfully' }),
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
