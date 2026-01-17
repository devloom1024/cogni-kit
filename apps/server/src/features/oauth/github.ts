import { env } from '../../config/env.js'
import { logger } from '../../shared/logger.js'
import { oauthService, type OAuthUserProfile } from './service.js'
import { SocialProvider, type AuthResponse } from 'shared'

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_USER_URL = 'https://api.github.com/user'

export const githubOAuth = {
  getAuthUrl(redirectUri?: string): string {
    if (!env.GITHUB_CLIENT_ID) {
      throw new Error('GitHub OAuth not configured')
    }

    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      scope: 'user:email',
      redirect_uri: redirectUri || `${env.FRONTEND_URL}/auth/callback/github`,
    })

    return `${GITHUB_OAUTH_URL}?${params.toString()}`
  },

  async handleCallback(
    code: string,
    redirectUri?: string
  ): Promise<AuthResponse & { isNewUser: boolean }> {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      throw new Error('GitHub OAuth not configured')
    }

    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri || `${env.FRONTEND_URL}/auth/callback/github`,
      }),
    })

    if (!tokenResponse.ok) {
      logger.error({ status: tokenResponse.status }, 'GitHub token exchange failed')
      throw new Error('Failed to exchange GitHub code for token')
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string
      token_type: string
      scope: string
    }

    const userResponse = await fetch(GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    })

    if (!userResponse.ok) {
      logger.error({ status: userResponse.status }, 'GitHub user fetch failed')
      throw new Error('Failed to fetch GitHub user')
    }

    const userData = await userResponse.json() as {
      id: number
      login: string
      email: string | null
      avatar_url: string
    }

    const profile: OAuthUserProfile = {
      providerId: userData.id.toString(),
      providerUsername: userData.login,
      providerEmail: userData.email || undefined,
      providerAvatar: userData.avatar_url,
      accessToken: tokenData.access_token,
    }

    return await oauthService.handleOAuthCallback(SocialProvider.github, profile)
  },
}
