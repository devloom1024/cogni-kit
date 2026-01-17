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
  SEND_CODE: '/auth/send-code',
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  OAUTH_URL: (provider: string) => `/auth/${provider}/url`,
  OAUTH_CALLBACK: (provider: string) => `/auth/${provider}/callback`,
  
  USER_ME: '/users/me',
} as const
