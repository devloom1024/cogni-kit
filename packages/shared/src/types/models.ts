// ==================== 枚举定义 ====================

/**
 * 用户状态枚举
 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
  DELETED: 'DELETED',
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

/**
 * 第三方登录平台枚举
 */
export const SocialProvider = {
  github: 'github',
  google: 'google',
  linuxdo: 'linuxdo',
} as const

export type SocialProvider = typeof SocialProvider[keyof typeof SocialProvider]

/**
 * 验证码类型枚举
 */
export const VerificationCodeType = {
  register: 'register',
  login: 'login',
  forgot_password: 'forgot_password',
  bind_email: 'bind_email',
  bind_phone: 'bind_phone',
} as const

export type VerificationCodeType = typeof VerificationCodeType[keyof typeof VerificationCodeType]

// ==================== 数据模型类型 ====================
// 注意: User 和 TokenPair 类型已迁移至 schemas/ 并通过 z.infer 推导
// 请从 'shared' 导入这些类型，它们现在由 Zod Schema 作为单一数据源

/**
 * 第三方账号信息
 */
export interface SocialAccount {
  id: string
  userId: string
  provider: SocialProvider
  providerId: string
  providerUsername: string | null
  providerEmail: string | null
  providerAvatar: string | null
  createdAt: string
  updatedAt: string
}

// ==================== 投资模块枚举定义 ====================

/**
 * 资产类型枚举
 */
export const AssetType = {
  STOCK: 'STOCK',   // A股
  INDEX: 'INDEX',   // 指数
  ETF: 'ETF',       // ETF
  LOF: 'LOF',       // LOF基金
  OFUND: 'OFUND',   // 场外基金 (Outdoor Fund)
} as const

export type AssetType = typeof AssetType[keyof typeof AssetType]

/**
 * 指数类型枚举
 */
export const IndexType = {
  BROAD: 'BROAD',     // 大盘指数 (如 上证指数、深证成指)
  SECTOR: 'SECTOR',   // 行业指数 (如 半导体指数、白酒指数)
  THEME: 'THEME',     // 主题指数 (如 新能源指数)
  STRATEGY: 'STRATEGY', // 策略指数 (如 红利指数、指数增强)
} as const

export type IndexType = typeof IndexType[keyof typeof IndexType]

/**
 * 交易所/板块枚举
 */
export const Exchange = {
  SSE: 'SSE',   // 上海证券交易所
  SZSE: 'SZSE', // 深圳证券交易所
  BJSE: 'BJSE', // 北京证券交易所
  HKEX: 'HKEX', // 香港联合交易所
} as const

export type Exchange = typeof Exchange[keyof typeof Exchange]

/**
 * 场外基金类型枚举
 */
export const FundType = {
  MONEY: 'MONEY',   // 货币基金
  BOND: 'BOND',     // 债券基金
  MIXED: 'MIXED',   // 混合基金
  STOCK: 'STOCK',   // 股票基金
  QDII: 'QDII',     // QDII基金 (合格境内机构投资者)
  REIT: 'REIT',     // REITs基金 (不动产投资信托)
} as const

export type FundType = typeof FundType[keyof typeof FundType]

/**
 * 市场枚举
 */
export const AssetMarket = {
  CN: 'CN', // 中国 (A股/场内)
  HK: 'HK', // 香港
  US: 'US', // 美国
} as const

export type AssetMarket = typeof AssetMarket[keyof typeof AssetMarket]
