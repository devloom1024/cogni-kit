import { z } from 'zod'
import { VerificationCodeType } from '../types/models.js'

export const passwordSchema = z
  .string()
  .min(8, 'validation.password.min')
  .max(128, 'validation.password.max')
  .regex(/[A-Z]/, 'validation.password.uppercase')
  .regex(/[a-z]/, 'validation.password.lowercase')
  .regex(/[0-9]/, 'validation.password.number')

export const sendCodeSchema = z.object({
  target: z.string().email('validation.email.invalid'),
  type: z.nativeEnum(VerificationCodeType),
})

export const registerSchema = z.object({
  email: z.string().email('validation.email.invalid'),
  password: passwordSchema,
  repeatPassword: z.string(),
  code: z.string().length(6, 'validation.code.length'),
}).refine(data => data.password === data.repeatPassword, {
  message: "validation.password.mismatch",
  path: ['repeatPassword'],
})

export const loginSchema = z.object({
  account: z.string().min(1, 'validation.account.required'),
  password: z.string().min(1, 'validation.password.required'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'validation.refresh_token.required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.email.invalid'),
  code: z.string().length(6, 'validation.code.length'),
  newPassword: passwordSchema,
  repeatNewPassword: z.string(),
}).refine(data => data.newPassword === data.repeatNewPassword, {
  message: "validation.password.mismatch",
  path: ['repeatNewPassword'],
})

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'validation.auth_code.required'),
  redirectUri: z.string().url().optional(),
})

export type SendCodeRequest = z.infer<typeof sendCodeSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>
export type OAuthCallbackRequest = z.infer<typeof oauthCallbackSchema>
