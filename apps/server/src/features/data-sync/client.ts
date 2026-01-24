import { API_PATHS } from 'shared'
import { env } from '../../config/env.js'
import type {
  FinancialDataResponse,
  FinancialBaseItem,
  FinancialFundItem,
} from './types.js'
import type { AssetMarket, FundType } from '@prisma/client'
import { logger } from '../../shared/logger.js'

/**
 * Financial Data API 客户端
 * 负责调用 Python financial-data 服务的 API 获取原始数据
 */
export const financialClient = {
  /**
   * 获取 A 股列表
   */
  async getStocks(): Promise<FinancialDataResponse<FinancialBaseItem>> {
    const res = await fetch(`${env.FINANCIAL_DATA_URL}${API_PATHS.FINANCIAL_DATA_STOCK}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch stocks: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<FinancialDataResponse<FinancialBaseItem>>
  },

  /**
   * 获取指数列表
   */
  async getIndexes(): Promise<FinancialDataResponse<FinancialBaseItem>> {
    const res = await fetch(`${env.FINANCIAL_DATA_URL}${API_PATHS.FINANCIAL_DATA_INDEX}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch indexes: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<FinancialDataResponse<FinancialBaseItem>>
  },

  /**
   * 获取 ETF 列表
   */
  async getEtfs(): Promise<FinancialDataResponse<FinancialBaseItem>> {
    const res = await fetch(`${env.FINANCIAL_DATA_URL}${API_PATHS.FINANCIAL_DATA_ETF}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch ETFs: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<FinancialDataResponse<FinancialBaseItem>>
  },

  /**
   * 获取 LOF 列表
   */
  async getLofs(): Promise<FinancialDataResponse<FinancialBaseItem>> {
    const res = await fetch(`${env.FINANCIAL_DATA_URL}${API_PATHS.FINANCIAL_DATA_LOF}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch LOFs: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<FinancialDataResponse<FinancialBaseItem>>
  },

  /**
   * 获取场外基金列表
   */
  async getFunds(): Promise<FinancialDataResponse<FinancialFundItem>> {
    const res = await fetch(`${env.FINANCIAL_DATA_URL}${API_PATHS.FINANCIAL_DATA_FUND}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch funds: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<FinancialDataResponse<FinancialFundItem>>
  },
}

/**
 * 解析市场字符串为 AssetMarket 枚举
 */
function parseMarket(market?: string): AssetMarket {
  if (!market) return 'CN'
  switch (market.toUpperCase()) {
    case 'HK':
      return 'HK'
    case 'US':
      return 'US'
    default:
      return 'CN'
  }
}

/**
 * 解析 A 股/指数/ETF/LOF 数据
 */
export function parseBaseAsset(
  item: FinancialBaseItem,
  type: 'STOCK' | 'INDEX' | 'ETF' | 'LOF'
) {
  return {
    symbol: item.symbol,
    name: item.name,
    type,
    market: parseMarket(item.market),
  }
}

/**
 * 解析场外基金数据 (financial-data 已转换 fundType，直接使用)
 */
export function parseFundAsset(item: FinancialFundItem) {
  // 空字符串或 undefined 时设为 null
  const fundType = item.fundType && item.fundType.trim() !== ''
    ? (item.fundType as FundType)
    : null

  return {
    symbol: item.symbol,
    name: item.name,
    type: 'OFUND' as const,
    market: 'CN' as const,
    fundType,
    pinyinInitial: item.pinyinInitial ?? null,
    pinyinFull: item.pinyinFull ?? null,
  }
}
