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
 * 场外基金类型枚举 (完整 32 种)
 * 注意: 类型与 prisma/schema.prisma 的 enum FundType 保持一致
 */
export const FundType = {
  // 货币型 (2种)
  MONEY_NORMAL: 'MONEY_NORMAL',        // 货币型-普通货币
  MONEY_FLOATING: 'MONEY_FLOATING',    // 货币型-浮动净值

  // 债券型 (4种)
  BOND_LONG: 'BOND_LONG',              // 债券型-长债
  BOND_SHORT: 'BOND_SHORT',            // 债券型-中短债
  BOND_MIXED_1: 'BOND_MIXED_1',        // 债券型-混合一级
  BOND_MIXED_2: 'BOND_MIXED_2',        // 债券型-混合二级

  // 混合型 (5种)
  MIXED_STOCK: 'MIXED_STOCK',          // 混合型-偏股
  MIXED_BOND: 'MIXED_BOND',            // 混合型-偏债
  MIXED_BALANCED: 'MIXED_BALANCED',    // 混合型-平衡
  MIXED_FLEXIBLE: 'MIXED_FLEXIBLE',    // 混合型-灵活
  MIXED_ABSOLUTE: 'MIXED_ABSOLUTE',    // 混合型-绝对收益

  // 股票型 (1种)
  STOCK: 'STOCK',                      // 股票型

  // 指数型 (4种)
  INDEX_STOCK: 'INDEX_STOCK',          // 指数型-股票
  INDEX_BOND: 'INDEX_BOND',            // 指数型-固收
  INDEX_OVERSEAS: 'INDEX_OVERSEAS',    // 指数型-海外股票
  INDEX_OTHER: 'INDEX_OTHER',          // 指数型-其他

  // QDII (9种)
  QDII_STOCK: 'QDII_STOCK',            // QDII-普通股票
  QDII_MIXED_STOCK: 'QDII_MIXED_STOCK',// QDII-混合偏股
  QDII_MIXED_BOND: 'QDII_MIXED_BOND',  // QDII-混合债
  QDII_MIXED_FLEXIBLE: 'QDII_MIXED_FLEXIBLE',  // QDII-混合灵活
  QDII_MIXED_BALANCED: 'QDII_MIXED_BALANCED',  // QDII-混合平衡
  QDII_BOND: 'QDII_BOND',              // QDII-纯债
  QDII_COMMODITY: 'QDII_COMMODITY',    // QDII-商品
  QDII_FOF: 'QDII_FOF',                // QDII-FOF
  QDII_REIT: 'QDII_REIT',              // QDII-REITs

  // FOF (3种)
  FOF_CONSERVATIVE: 'FOF_CONSERVATIVE',// FOF-稳健型
  FOF_BALANCED: 'FOF_BALANCED',        // FOF-均衡型
  FOF_AGGRESSIVE: 'FOF_AGGRESSIVE',    // FOF-进取型

  // 另类 (3种)
  REIT: 'REIT',                        // Reits/REITs
  COMMODITY: 'COMMODITY',              // 商品
  OTHER: 'OTHER',                      // 其他/空值
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
