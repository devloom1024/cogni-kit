import { assetRepository } from '../asset/repository.js'
import { financialClient, parseBaseAsset, parseFundAsset } from './client.js'
import type { FinancialDataResponse, FinancialBaseItem, FinancialFundItem } from './types.js'
import { logger } from '../../shared/logger.js'

/**
 * 单个数据源的同步结果
 */
interface SyncResult<T> {
  success: boolean
  data?: T
  error?: Error
}

/**
 * 数据同步服务
 * 负责从 financial-data 服务同步投资标的数据到本地数据库
 */
export const dataSyncService = {
  /**
   * 同步所有资产数据
   * 支持部分失败：即使某个数据源失败，也会继续同步其他数据源
   */
  async syncAllAssets(): Promise<{
    success: boolean
    count: number
    duration: number
    results: Record<string, { success: boolean; count: number; error?: string }>
  }> {
    const startTime = Date.now()
    logger.info('Starting asset sync...')

    const results: Record<string, { success: boolean; count: number; error?: string }> = {}

    try {
      // 1. 逐个获取数据（支持部分失败）
      const stocksResult = await fetchWithRetry('STOCK', () => financialClient.getStocks())
      const indexesResult = await fetchWithRetry('INDEX', () => financialClient.getIndexes())
      const etfsResult = await fetchWithRetry('ETF', () => financialClient.getEtfs())
      const lofsResult = await fetchWithRetry('LOF', () => financialClient.getLofs())
      const fundsResult = await fetchWithRetry('OFUND', () => financialClient.getFunds())

      results.STOCK = stocksResult
      results.INDEX = indexesResult
      results.ETF = etfsResult
      results.LOF = lofsResult
      results.OFUND = fundsResult

      // 记录各数据源的同步结果（只打印统计信息，不打印数据）
      logger.info({
        stocks: stocksResult.count,
        indexes: indexesResult.count,
        etfs: etfsResult.count,
        lofs: lofsResult.count,
        funds: fundsResult.count,
      }, 'Fetched data from financial-data service')

      // 检查是否有任何成功的数据
      const hasSuccess = Object.values(results).some(r => r.success)
      if (!hasSuccess) {
        throw new Error('All data sources failed to fetch')
      }

      // 2. 统一处理并转换类型（只处理成功的数据源）
      const assets: ReturnType<typeof parseBaseAsset | typeof parseFundAsset>[] = []

      if (stocksResult.success && stocksResult.data) {
        assets.push(...stocksResult.data.data.map((item) => parseBaseAsset(item, 'STOCK')))
      }
      if (indexesResult.success && indexesResult.data) {
        assets.push(...indexesResult.data.data.map((item) => parseBaseAsset(item, 'INDEX')))
      }
      if (etfsResult.success && etfsResult.data) {
        assets.push(...etfsResult.data.data.map((item) => parseBaseAsset(item, 'ETF')))
      }
      if (lofsResult.success && lofsResult.data) {
        assets.push(...lofsResult.data.data.map((item) => parseBaseAsset(item, 'LOF')))
      }
      if (fundsResult.success && fundsResult.data) {
        // 所有基金都同步，fundType 等字段允许为空
        assets.push(...fundsResult.data.data.map(parseFundAsset))
      }

      // 3. 批量写入 (upsert)
      const writtenCount = assets.length
      if (assets.length > 0) {
        await assetRepository.upsertMany(assets)
      }

      const duration = Date.now() - startTime

      // 返回实际写入的记录数
      return { success: true, count: writtenCount, duration, results }
    } catch (error) {
      const duration = Date.now() - startTime
      // 日志输出时清理结果（移除 data 字段避免大量输出）
      const cleanResults = Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, { success: v.success, count: v.count, error: v.error }])
      )
      logger.error({ error, duration, results: cleanResults }, 'Asset sync failed')

      return { success: false, count: 0, duration, results }
    }
  },

  /**
   * 仅同步指定类型的资产
   */
  async syncAssetsByType(type: 'STOCK' | 'INDEX' | 'ETF' | 'LOF' | 'OFUND'): Promise<{ success: boolean; count: number; duration: number }> {
    const startTime = Date.now()
    logger.info({ type }, 'Starting asset sync by type...')

    try {
      let data: FinancialDataResponse<FinancialBaseItem | FinancialFundItem>

      switch (type) {
        case 'STOCK':
          data = await financialClient.getStocks()
          break
        case 'INDEX':
          data = await financialClient.getIndexes()
          break
        case 'ETF':
          data = await financialClient.getEtfs()
          break
        case 'LOF':
          data = await financialClient.getLofs()
          break
        case 'OFUND': {
          const fundsRes = await financialClient.getFunds()
          const assets = fundsRes.data.map(parseFundAsset)
          await assetRepository.upsertMany(assets)
          const duration = Date.now() - startTime
          logger.info({ type, count: assets.length, duration }, 'Asset sync by type completed')
          return { success: true, count: assets.length, duration }
        }
      }

      const assets = data.data.map((item) => parseBaseAsset(item, type as 'STOCK' | 'INDEX' | 'ETF' | 'LOF'))
      await assetRepository.upsertMany(assets)

      const duration = Date.now() - startTime
      logger.info({ type, count: assets.length, duration }, 'Asset sync by type completed')

      return { success: true, count: assets.length, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error({ error, type, duration }, 'Asset sync by type failed')

      return { success: false, count: 0, duration }
    }
  },

  /**
   * 获取同步统计信息
   */
  async getSyncStats() {
    const [assetCount, latestAsset] = await Promise.all([
      assetRepository.count(),
      assetRepository.findLatestBySyncedAt(),
    ])

    return {
      assetCount,
      lastSyncTime: latestAsset?.lastSyncedAt ?? null,
    }
  },
}

/**
 * 带错误处理的获取函数
 */
async function fetchWithRetry<T>(
  name: string,
  fetcher: () => Promise<FinancialDataResponse<T>>
): Promise<{ success: boolean; count: number; data?: FinancialDataResponse<T>; error?: string }> {
  try {
    const data = await fetcher()
    return { success: true, count: data.count, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = (error as { code?: string })?.code
    logger.error({
      type: name,
      errorCode,
      errorMessage: errorMessage.slice(0, 200),
    }, `Failed to fetch ${name} data`)
    return { success: false, count: 0, error: errorMessage }
  }
}
