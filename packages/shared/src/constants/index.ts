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

  // ==================== 投资自选模块 ====================

  /// 资产搜索
  ASSET_SEARCH: '/api/v1/assets/search',
  /// 获取自选分组列表
  WATCHLIST_GROUPS: '/api/v1/watchlist/groups',
  /// 获取分组内的标的列表
  WATCHLIST_GROUP_ITEMS: (groupId: string) => `/api/v1/watchlist/groups/${groupId}/items`,
  /// 获取所有自选标的
  WATCHLIST_ITEMS: '/api/v1/watchlist/items',
  /// 获取单个自选标的
  WATCHLIST_ITEM: (itemId: string) => `/api/v1/watchlist/items/${itemId}`,
  /// 移动自选标的分组
  WATCHLIST_ITEM_MOVE: (itemId: string) => `/api/v1/watchlist/items/${itemId}/move`,
  /// 批量调整分组排序
  WATCHLIST_GROUPS_REORDER: '/api/v1/watchlist/groups/reorder',
  /// 批量移除自选标的
  WATCHLIST_ITEMS_BATCH_REMOVE: '/api/v1/watchlist/items/batch-remove',


  // ==================== Financial Data 服务 ====================

  /// Financial Data 服务基础路径
  FINANCIAL_DATA_BASE: '/api/v1/akshare',
  /// A股列表
  FINANCIAL_DATA_STOCK: '/api/v1/akshare/stock/list',
  /// 指数列表
  FINANCIAL_DATA_INDEX: '/api/v1/akshare/index/list',
  /// ETF 列表
  FINANCIAL_DATA_ETF: '/api/v1/akshare/etf/list',
  /// LOF 列表
  FINANCIAL_DATA_LOF: '/api/v1/akshare/lof/list',
  /// 场外基金列表
  FINANCIAL_DATA_FUND: '/api/v1/akshare/fund/list',
} as const
