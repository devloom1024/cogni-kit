export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
} as const

export const VERIFICATION_CODE_CONFIG = {
  LENGTH: 6,
  EXPIRES_IN_MINUTES: 10,
  RATE_LIMIT_PER_EMAIL: 5,
  RATE_LIMIT_WINDOW_MINUTES: 60,
} as const

export const OAUTH_PROVIDERS = ['github', 'google', 'linuxdo'] as const
export type OAuthProvider = typeof OAUTH_PROVIDERS[number]

export const API_PATHS = {
  SEND_CODE: '/api/v1/auth/send-code',
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh-token',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',

  OAUTH_URL: (provider: OAuthProvider) => `/api/v1/auth/${provider}/url`,
  OAUTH_CALLBACK: (provider: OAuthProvider) => `/api/v1/auth/${provider}/callback`,

  USER_ME: '/api/v1/users/me',
} as const
