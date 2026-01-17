import { env } from '../../config/env.js'
import { logger } from '../../shared/logger.js'
import { oauthService, type OAuthUserProfile } from './service.js'
import { SocialProvider, type AuthResponse } from 'shared'

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USER_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export const googleOAuth = {
  getAuthUrl(redirectUri?: string): string {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth not configured')
    }

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri || `${env.FRONTEND_URL}/auth/callback/google`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })

    return `${GOOGLE_OAUTH_URL}?${params.toString()}`
  },

  async handleCallback(
    code: string,
    redirectUri?: string
  ): Promise<AuthResponse & { isNewUser: boolean }> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth not configured')
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || `${env.FRONTEND_URL}/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      logger.error({ status: tokenResponse.status }, 'Google token exchange failed')
      throw new Error('Failed to exchange Google code for token')
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string
      refresh_token?: string
      expires_in: number
      token_type: string
    }

    const userResponse = await fetch(GOOGLE_USER_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      logger.error({ status: userResponse.status }, 'Google user fetch failed')
      throw new Error('Failed to fetch Google user')
    }

    const userData = await userResponse.json() as {
      id: string
      email: string
      verified_email: boolean
      name: string
      picture: string
    }

    const profile: OAuthUserProfile = {
      providerId: userData.id,
      providerUsername: userData.name,
      providerEmail: userData.verified_email ? userData.email : undefined,
      providerAvatar: userData.picture,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    }

    return await oauthService.handleOAuthCallback(SocialProvider.google, profile)
  },
}
