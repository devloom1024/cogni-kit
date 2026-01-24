import { assetRepository } from './repository.js'
import type { AssetSearchQuery, AssetSearchResult } from 'shared'
import { logger } from '../../shared/logger.js'

/**
 * 资产搜索参数
 */
export interface SearchAssetsParams {
  query: string
  type?: string
  market?: string
  limit?: number
}

/**
 * 资产服务层
 * 负责资产相关的业务逻辑
 */
export const assetService = {
  /**
   * 搜索资产
   * 支持代码、名称、拼音首字母、拼音全拼、基金公司搜索
   */
  async searchAssets(params: SearchAssetsParams): Promise<AssetSearchResult[]> {
    const { query, type, market, limit = 20 } = params

    logger.info({ query, type, market, limit }, 'Searching assets')

    const assets = await assetRepository.search({
      query,
      type: type as any,
      market: market as any,
      limit,
    })

    // 转换为 API 响应格式
    return assets.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      market: asset.market,
      exchange: asset.exchange,
      indexType: asset.indexType,
      fundCompany: asset.fundCompany,
      fundType: asset.fundType,
      pinyinInitial: asset.pinyinInitial,
    }))
  },

  /**
   * 根据搜索查询参数搜索资产
   * 兼容 OpenAPI 生成的查询类型
   */
  async searchByQuery(query: AssetSearchQuery): Promise<AssetSearchResult[]> {
    return this.searchAssets({
      query: query.q,
      type: query.type,
      market: query.market,
      limit: query.limit,
    })
  },

  /**
   * 根据 ID 获取资产详情
   */
  async getAssetById(id: string) {
    const asset = await assetRepository.findById(id)

    if (!asset) {
      return null
    }

    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      market: asset.market,
      exchange: asset.exchange,
      indexType: asset.indexType,
      fundCompany: asset.fundCompany,
      fundType: asset.fundType,
      pinyinInitial: asset.pinyinInitial,
    }
  },

  /**
   * 验证资产是否存在
   */
  async validateAssetExists(assetId: string): Promise<boolean> {
    const asset = await assetRepository.findById(assetId)
    return !!asset
  },
}
