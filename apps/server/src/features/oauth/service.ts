import { Prisma, User } from '@prisma/client'
import { prisma } from '../../shared/db.js'
import { generateAccessToken } from '../../shared/lib/jwt.js'
import { generateUsername, generateRefreshToken } from '../../shared/lib/random.js'
import { logger } from '../../shared/logger.js'
import {
  SocialProvider,
  UserStatus,
  TOKEN_CONFIG,
  type AuthResponse,
  type TokenPair,
  ErrorCode,
} from 'shared'
import { AppError } from '../../shared/error.js'

export interface OAuthUserProfile {
  providerId: string
  providerUsername?: string
  providerEmail?: string
  providerAvatar?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
}

export const oauthService = {
  /**
   * 处理 OAuth 回调，创建或关联用户账号
   * 
   * 逻辑：
   * 1. 查找 SocialAccount (provider + providerId)
   * 2. 如果已绑定 → 直接登录
   * 3. 如果未绑定但 email 存在 → 关联到现有用户
   * 4. 如果是全新用户 → 创建新用户 + SocialAccount
   */
  async handleOAuthCallback(
    provider: SocialProvider,
    profile: OAuthUserProfile
  ): Promise<AuthResponse & { isNewUser: boolean }> {
    // 1. 查找是否已绑定
    const socialAccount = await prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    })

    if (socialAccount) {
      // 已绑定，直接登录
      if (socialAccount.user.status !== UserStatus.ACTIVE) {
        throw new AppError(ErrorCode.ACCOUNT_INACTIVE, 403)
      }

      const tokens = await createSession(prisma, socialAccount.userId)

      logger.info(
        { userId: socialAccount.userId, provider },
        'OAuth login (existing user)'
      )

      return {
        user: formatUser(socialAccount.user),
        tokens,
        isNewUser: false,
      }
    }

    // 2. 未绑定，检查 email 是否已存在
    const user = profile.providerEmail
      ? await prisma.user.findUnique({ where: { email: profile.providerEmail } })
      : null

    if (user) {
      // 关联到现有用户
      const result = await prisma.$transaction(async (tx) => {
        await tx.socialAccount.create({
          data: {
            userId: user!.id,
            provider,
            providerId: profile.providerId,
            providerUsername: profile.providerUsername,
            providerEmail: profile.providerEmail,
            providerAvatar: profile.providerAvatar,
            accessToken: profile.accessToken,
            refreshToken: profile.refreshToken,
            expiresAt: profile.expiresAt,
          },
        })

        const tokens = await createSession(tx, user!.id)

        return { tokens }
      })

      logger.info(
        { userId: user.id, provider },
        'OAuth linked to existing user'
      )

      return {
        user: formatUser(user),
        tokens: result.tokens,
        isNewUser: false,
      }
    }

    // 3. 全新用户，创建账号
    const result = await prisma.$transaction(async (tx) => {
      const username = generateUsername()

      const newUser = await tx.user.create({
        data: {
          username,
          email: profile.providerEmail,
          emailVerified: !!profile.providerEmail,
          avatar: profile.providerAvatar,
          status: UserStatus.ACTIVE,
        },
      })

      await tx.socialAccount.create({
        data: {
          userId: newUser.id,
          provider,
          providerId: profile.providerId,
          providerUsername: profile.providerUsername,
          providerEmail: profile.providerEmail,
          providerAvatar: profile.providerAvatar,
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken,
          expiresAt: profile.expiresAt,
        },
      })

      const tokens = await createSession(tx, newUser.id)

      return { user: newUser, tokens }
    })

    logger.info(
      { userId: result.user.id, provider },
      'OAuth registered new user'
    )

    return {
      user: formatUser(result.user),
      tokens: result.tokens,
      isNewUser: true,
    }
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

function formatUser(user: User) {
  return {
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
