import type { AssetType, AssetMarket, Exchange, IndexType, FundType } from '@prisma/client'

/**
 * Financial Data API 响应类型
 * 这些类型定义从 financial-data Python 服务返回的数据结构
 */

/**
 * A股/指数/ETF/LOF 基础项
 */
export interface FinancialBaseItem {
  symbol: string
  name: string
  market?: string
}

/**
 * 场外基金项 (fundType 已经是枚举值字符串，由 financial-data 转换完成)
 */
export interface FinancialFundItem {
  symbol: string
  name: string
  fundType: string  // 已是枚举值字符串 (MONEY, BOND, MIXED, STOCK, QDII, REIT)
  pinyinInitial?: string
  pinyinFull?: string
}

/**
 * Financial Data API 统一响应格式
 */
export interface FinancialDataResponse<T> {
  data: T[]
  count: number
}

/**
 * 同步后的资产数据 (用于 upsertMany)
 */
export interface SyncAssetData {
  symbol: string
  name: string
  type: AssetType
  market: AssetMarket
  exchange?: Exchange | null
  indexType?: IndexType | null
  fundCompany?: string | null
  fundType?: FundType | null
  pinyinInitial?: string | null
  pinyinFull?: string | null
}
