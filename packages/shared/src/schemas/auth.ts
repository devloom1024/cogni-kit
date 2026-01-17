import { z } from 'zod'
import { VerificationCodeType } from '../types/models.js'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const sendCodeSchema = z.object({
  target: z.string().email('Invalid email address'),
  type: z.nativeEnum(VerificationCodeType),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  repeatPassword: z.string(),
  code: z.string().length(6, 'Code must be 6 digits'),
}).refine(data => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ['repeatPassword'],
})

export const loginSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  password: z.string().min(1, 'Password is required'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: passwordSchema,
  repeatNewPassword: z.string(),
}).refine(data => data.newPassword === data.repeatNewPassword, {
  message: "Passwords don't match",
  path: ['repeatNewPassword'],
})

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z.string().url().optional(),
})

export type SendCodeRequest = z.infer<typeof sendCodeSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>
export type OAuthCallbackRequest = z.infer<typeof oauthCallbackSchema>
