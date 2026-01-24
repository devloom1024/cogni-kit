import { z } from '@hono/zod-openapi'
import { AssetType, AssetMarket, Exchange, IndexType, FundType } from '../types/index.js'

/**
 * 资产搜索结果 Schema
 * 用于标的搜索接口返回的数据结构
 */
export const AssetSearchResultSchema = z.object({
  /// 资产唯一标识
  id: z.string().uuid().openapi({
    description: '资产唯一标识',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  /// 标的代码 (如 600519 贵州茅台)
  symbol: z.string().openapi({
    description: '标的代码',
    example: '600519',
  }),
  /// 标的名称
  name: z.string().openapi({
    description: '标的名称',
    example: '贵州茅台',
  }),
  /// 资产类型 (STOCK/INDEX/ETF/LOF/OFUND)
  type: z.nativeEnum(AssetType).openapi({
    description: '资产类型 (STOCK: A股, INDEX: 指数, ETF: ETF, LOF: LOF基金, OFUND: 场外基金)',
    example: 'STOCK',
  }),
  /// 市场 (CN/HK/US)
  market: z.nativeEnum(AssetMarket).openapi({
    description: '市场 (CN: 中国, HK: 香港, US: 美国)',
    example: 'CN',
  }),
  /// 交易所/板块 (SSE/SZSE/BJSE/HKEX)
  exchange: z.nativeEnum(Exchange).nullable().optional().openapi({
    description: '交易所/板块 (A股/指数/ETF/LOF 有值)',
    example: 'SSE',
  }),
  /// 指数类型 (仅 INDEX 类型有值)
  indexType: z.nativeEnum(IndexType).nullable().optional().openapi({
    description: '指数类型 (BROAD: 大盘指数, SECTOR: 行业指数, THEME: 主题指数, STRATEGY: 策略指数)',
    example: 'BROAD',
  }),
  /// 基金公司 (ETF/LOF/场外基金有值)
  fundCompany: z.string().nullable().optional().openapi({
    description: '基金公司 (ETF/LOF/场外基金有值)',
    example: '易方达基金',
  }),
  /// 场外基金类型 (仅 OFUND 类型有值)
  fundType: z.nativeEnum(FundType).nullable().optional().openapi({
    description: '场外基金类型 (MONEY: 货币基金, BOND: 债券基金, MIXED: 混合基金, STOCK: 股票基金, QDII: QDII基金, REIT: REITs基金)',
    example: 'STOCK',
  }),
  /// 拼音首字母 (用于搜索，如 "ZGMT" 为中国平安)
  pinyinInitial: z.string().nullable().optional().openapi({
    description: '拼音首字母 (用于搜索)',
    example: 'ZGMT',
  }),
}).openapi('AssetSearchResult')

/// 资产搜索结果类型
export type AssetSearchResult = z.infer<typeof AssetSearchResultSchema>

/// 资产搜索参数 Schema
export const AssetSearchQuerySchema = z.object({
  /// 搜索关键词
  q: z.string().min(1).max(50).openapi({
    description: '搜索关键词 (支持代码、名称、拼音)',
    example: '贵州',
  }),
  /// 资产类型过滤
  type: z.nativeEnum(AssetType).optional().openapi({
    description: '资产类型过滤',
    example: 'STOCK',
  }),
  /// 市场过滤
  market: z.nativeEnum(AssetMarket).optional().openapi({
    description: '市场过滤',
    example: 'CN',
  }),
  /// 返回结果数量限制
  limit: z.number().int().min(1).max(100).default(20).openapi({
    description: '返回结果数量限制，默认 20，最大 100',
    example: 20,
  }),
}).openapi('AssetSearchQuery')

/// 资产搜索参数类型
export type AssetSearchQuery = z.infer<typeof AssetSearchQuerySchema>
