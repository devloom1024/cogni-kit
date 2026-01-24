import { prisma } from '../../shared/db.js'
import type { AssetType, AssetMarket } from '@prisma/client'
import type { AssetSearchQuery } from 'shared'
import type { Exchange, IndexType, FundType } from 'shared'

/**
 * 资产搜索参数
 */
export interface AssetSearchParams {
  /// 搜索关键词
  query: string
  /// 资产类型过滤
  type?: AssetType
  /// 市场过滤
  market?: AssetMarket
  /// 返回数量限制
  limit?: number
}

/**
 * 资产数据访问层
 * 负责资产数据的查询和管理
 */
export const assetRepository = {
  /**
   * 搜索资产
   * 支持代码、名称、拼音首字母、拼音全拼、基金公司搜索
   */
  async search(params: AssetSearchParams) {
    const { query, type, market, limit = 20 } = params

    return prisma.asset.findMany({
      where: {
        OR: [
          { symbol: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { pinyinInitial: { contains: query, mode: 'insensitive' } },
          { pinyinFull: { contains: query, mode: 'insensitive' } },
          { fundCompany: { contains: query, mode: 'insensitive' } },
        ],
        ...(type && { type }),
        ...(market && { market }),
      },
      take: limit,
      orderBy: { symbol: 'asc' },
    })
  },

  /**
   * 根据搜索查询参数搜索资产
   * 兼容 OpenAPI 生成的查询类型
   */
  async searchByQuery(query: AssetSearchQuery) {
    return this.search({
      query: query.q,
      type: query.type,
      market: query.market,
      limit: query.limit,
    })
  },

  /**
   * 根据 ID 获取资产
   */
  async findById(id: string) {
    return prisma.asset.findUnique({ where: { id } })
  },

  /**
   * 根据 market + symbol 获取资产
   */
  async findByMarketSymbol(market: AssetMarket, symbol: string) {
    return prisma.asset.findUnique({
      where: { market_symbol: { market, symbol } },
    })
  },

  /**
   * 批量创建/更新资产
   * 用于数据同步场景
   */
  async upsertMany(assets: Array<{
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
  }>) {
    // 分批处理，每批 1000 条，避免事务超时
    const BATCH_SIZE = 1000
    const batches: Array<typeof assets> = []

    for (let i = 0; i < assets.length; i += BATCH_SIZE) {
      batches.push(assets.slice(i, i + BATCH_SIZE))
    }

    // 逐批写入
    for (const batch of batches) {
      await prisma.$transaction(
        (tx) =>
          Promise.all(
            batch.map((asset) =>
              tx.asset.upsert({
                where: {
                  market_symbol: {
                    market: asset.market,
                    symbol: asset.symbol,
                  },
                },
                update: {
                  name: asset.name,
                  exchange: asset.exchange ?? null,
                  indexType: asset.indexType ?? null,
                  fundCompany: asset.fundCompany,
                  fundType: asset.fundType ?? null,
                  pinyinInitial: asset.pinyinInitial,
                  pinyinFull: asset.pinyinFull,
                  lastSyncedAt: new Date(),
                },
                create: {
                  symbol: asset.symbol,
                  name: asset.name,
                  type: asset.type,
                  market: asset.market,
                  exchange: asset.exchange ?? null,
                  indexType: asset.indexType ?? null,
                  fundCompany: asset.fundCompany,
                  fundType: asset.fundType ?? null,
                  pinyinInitial: asset.pinyinInitial,
                  pinyinFull: asset.pinyinFull,
                },
              })
            )
          ),
        { timeout: 30000 } // 单个事务超时 30 秒
      )
    }
  },

  /**
   * 统计资产总数
   */
  async count() {
    return prisma.asset.count()
  },

  /**
   * 获取所有资产 (用于全量同步)
   */
  async findAll() {
    return prisma.asset.findMany({
      orderBy: { symbol: 'asc' },
    })
  },

  /**
   * 获取最近同步的资产 (高效查询，只取 1 条)
   */
  async findLatestBySyncedAt() {
    return prisma.asset.findFirst({
      orderBy: { lastSyncedAt: 'desc' },
    })
  },
}
