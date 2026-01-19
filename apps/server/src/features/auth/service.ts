import { Prisma } from '@prisma/client'
import { prisma } from '../../shared/db.js'
import { redis } from '../../shared/redis.js'
import { hashPassword, comparePassword } from '../../shared/lib/password.js'
import { generateAccessToken } from '../../shared/lib/jwt.js'
import { generateVerificationCode, generateUsername, generateRefreshToken } from '../../shared/lib/random.js'
import { sendVerificationCode } from '../../shared/email.js'
import { logger } from '../../shared/logger.js'

import {
  UserStatus,
  VerificationCodeType,
  TOKEN_CONFIG,
  VERIFICATION_CODE_CONFIG,
  type SendCodeRequest,
  type RegisterRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  type ForgotPasswordRequest,
  type AuthResponse,
  type TokenPair,
  ErrorCode,
} from 'shared'
import { AppError } from '../../shared/error.js'

const RATE_LIMIT_PREFIX = 'code_send_limit:'

export const authService = {
  async sendCode(params: SendCodeRequest): Promise<void> {
    const { target: email, type } = params

    const rateLimitKey = `${RATE_LIMIT_PREFIX}${email}`
    const sendCount = await redis.incr(rateLimitKey)

    if (sendCount === 1) {
      await redis.expire(rateLimitKey, VERIFICATION_CODE_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60)
    }

    if (sendCount > VERIFICATION_CODE_CONFIG.RATE_LIMIT_PER_EMAIL) {
      throw new AppError(ErrorCode.TOO_MANY_REQUESTS, 429)
    }

    if (type === VerificationCodeType.register) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        throw new AppError(ErrorCode.EMAIL_EXISTS, 409)
      }
    }

    if (type === VerificationCodeType.forgot_password) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (!existingUser) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
      }
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_CONFIG.EXPIRES_IN_MINUTES * 60 * 1000)

    await prisma.verificationCode.create({
      data: {
        target: email,
        code,
        type,
        expiresAt,
      },
    })

    await sendVerificationCode(email, code)

    logger.info({ email, type }, 'Verification code sent')
  },

  async register(params: RegisterRequest): Promise<AuthResponse> {
    const { email, password, code } = params

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        target: email,
        code,
        type: VerificationCodeType.register,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!verificationCode) {
      throw new AppError(ErrorCode.INVALID_CODE, 400)
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new AppError(ErrorCode.EMAIL_EXISTS, 409)
    }

    const passwordHash = await hashPassword(password)
    const username = generateUsername()

    const result = await prisma.$transaction(async (tx) => {
      await tx.verificationCode.update({
        where: { id: verificationCode.id },
        data: { usedAt: new Date() },
      })

      const user = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          emailVerified: true,
          status: UserStatus.ACTIVE,
        },
      })

      const tokens = await createSession(tx, user.id)

      return { user, tokens }
    })

    logger.info({ userId: result.user.id, email }, 'User registered')

    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        nickname: result.user.nickname,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
        phone: result.user.phone,
        phoneVerified: result.user.phoneVerified,
        avatar: result.user.avatar,
        status: result.user.status as UserStatus,
        createdAt: result.user.createdAt.toISOString(),
        updatedAt: result.user.updatedAt.toISOString(),
      },
      tokens: result.tokens,
    }
  },

  async login(params: LoginRequest): Promise<AuthResponse> {
    const { account, password } = params

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: account },
          { username: account },
        ],
      },
    })

    if (!user || !user.passwordHash) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 400)
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 400)
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError(ErrorCode.ACCOUNT_BANNED, 403)
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new AppError(ErrorCode.ACCOUNT_INACTIVE, 403)
    }

    if (user.status === UserStatus.DELETED) {
      throw new AppError(ErrorCode.ACCOUNT_DELETED, 403)
    }

    const tokens = await createSession(prisma, user.id)

    logger.info({ userId: user.id, account }, 'User logged in')

    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        avatar: user.avatar,
        status: user.status as UserStatus,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens,
    }
  },

  async refreshToken(params: RefreshTokenRequest): Promise<TokenPair> {
    const { refreshToken } = params

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    })

    if (!session || session.revoked) {
      throw new AppError(ErrorCode.INVALID_TOKEN, 401)
    }

    if (session.refreshTokenExpiresAt < new Date()) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 401)
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      throw new AppError(ErrorCode.ACCOUNT_INACTIVE, 403)
    }

    const newAccessToken = generateAccessToken(session.userId)
    const newRefreshToken = generateRefreshToken()
    const accessTokenExpiresAt = new Date(Date.now() + parseExpiry(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN))
    const refreshTokenExpiresAt = new Date(Date.now() + parseExpiry(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN))

    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        lastActiveAt: new Date(),
      },
    })

    logger.info({ userId: session.userId }, 'Token refreshed')

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: accessTokenExpiresAt.toISOString(),
    }
  },

  async logout(accessToken: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { accessToken },
    })

    if (!session) {
      return
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revoked: true },
    })

    logger.info({ userId: session.userId }, 'User logged out')
  },

  async resetPassword(params: ForgotPasswordRequest): Promise<void> {
    const { email, code, newPassword } = params

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        target: email,
        code,
        type: VerificationCodeType.forgot_password,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!verificationCode) {
      throw new AppError(ErrorCode.INVALID_CODE, 400)
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
    }

    const passwordHash = await hashPassword(newPassword)

    await prisma.$transaction(async (tx) => {
      await tx.verificationCode.update({
        where: { id: verificationCode.id },
        data: { usedAt: new Date() },
      })

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      })

      await tx.session.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      })
    })

    logger.info({ userId: user.id, email }, 'Password reset')
  },
}

async function createSession(tx: Prisma.TransactionClient, userId: string): Promise<TokenPair> {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken()
  const accessTokenExpiresAt = new Date(Date.now() + parseExpiry(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN))
  const refreshTokenExpiresAt = new Date(Date.now() + parseExpiry(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN))

  await tx.session.create({
    data: {
      userId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      lastActiveAt: new Date(),
    },
  })

  return {
    accessToken,
    refreshToken,
    expiresAt: accessTokenExpiresAt.toISOString(),
  }
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match || !match[1] || !match[2]) return 0

  const value = parseInt(match[1])
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return value * (multipliers[unit] ?? 0)
}
