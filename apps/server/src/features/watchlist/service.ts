import { watchlistRepository } from './repository.js'
import { assetRepository } from '../asset/repository.js'
import type {
  WatchlistGroup,
  WatchlistItem,
  CreateWatchlistGroupRequest,
  AddWatchlistItemRequest,
  PaginationMeta,
  AssetGroupCheckResult,
  WatchlistFilterQuery,
  BatchMoveWatchlistItemRequest,
} from 'shared'
import { logger } from '../../shared/logger.js'
import { AppError } from '../../shared/error.js'
import { ErrorCode } from 'shared'

/**
 * 分页结果类型
 */
interface PaginatedWatchlistResult {
  data: WatchlistItem[]
  meta: PaginationMeta
}

/**
 * 自选服务层
 * 负责自选分组和标的的業務邏輯
 */
export const watchlistService = {
  // ==================== 分组操作 ====================

  /**
   * 获取用户的所有自选分组
   */
  async getGroups(userId: string): Promise<WatchlistGroup[]> {
    logger.info({ userId }, 'Getting watchlist groups')

    const groups = await watchlistRepository.getGroups(userId)

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      sortOrder: group.sortOrder,
      itemCount: group._count.items,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }))
  },

  /**
   * 获取单个分组详情
   */
  async getGroupById(groupId: string, userId: string): Promise<WatchlistGroup | null> {
    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(groupId, userId)
    if (!isOwner) {
      return null
    }

    const group = await watchlistRepository.getGroupById(groupId)
    if (!group) {
      return null
    }

    return {
      id: group.id,
      name: group.name,
      sortOrder: group.sortOrder,
      itemCount: group._count.items,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }
  },

  /**
   * 创建自选分组
   */
  async createGroup(userId: string, data: CreateWatchlistGroupRequest): Promise<WatchlistGroup> {
    logger.info({ userId, name: data.name }, 'Creating watchlist group')

    const group = await watchlistRepository.createGroup({
      userId,
      name: data.name,
    })

    logger.info({ groupId: group.id }, 'Watchlist group created')

    return {
      id: group.id,
      name: group.name,
      sortOrder: group.sortOrder,
      itemCount: 0,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }
  },

  /**
   * 更新分组名称
   */
  async updateGroupName(groupId: string, userId: string, name: string): Promise<WatchlistGroup | null> {
    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(groupId, userId)
    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    const group = await watchlistRepository.updateGroupName(groupId, name)

    return {
      id: group.id,
      name: group.name,
      sortOrder: group.sortOrder,
      itemCount: 0, // 简化，不查询 count
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }
  },

  /**
   * 更新分组排序
   */
  async updateGroupSortOrder(groupId: string, userId: string, sortOrder: number): Promise<WatchlistGroup | null> {
    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(groupId, userId)
    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    const group = await watchlistRepository.updateGroupSortOrder(groupId, sortOrder)

    return {
      id: group.id,
      name: group.name,
      sortOrder: group.sortOrder,
      itemCount: 0,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }
  },

  /**
   * 批量调整分组排序
   */
  async reorderGroups(userId: string, orders: Array<{ id: string; sortOrder: number }>): Promise<void> {
    // 验证所有分组都属于当前用户
    for (const order of orders) {
      const isOwner = await watchlistRepository.verifyGroupOwnership(order.id, userId)
      if (!isOwner) {
        throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
      }
    }

    await watchlistRepository.reorderGroups(orders)
    logger.info({ userId, count: orders.length }, 'Watchlist groups reordered')
  },

  /**
   * 删除分组
   */
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(groupId, userId)
    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    await watchlistRepository.deleteGroup(groupId)
    logger.info({ groupId }, 'Watchlist group deleted')
  },

  // ==================== 标的操作 ====================

  /**
   * 获取分组内的标的（分页 + 过滤）
   */
  async getItemsByGroupId(
    groupId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: WatchlistFilterQuery
  ): Promise<PaginatedWatchlistResult> {
    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(groupId, userId)
    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    const result = await watchlistRepository.getItemsByGroupId(groupId, { page, limit }, filters)

    return {
      data: result.data.map(item => ({
        id: item.id,
        addedAt: item.createdAt.toISOString(),
        asset: {
          id: item.asset.id,
          symbol: item.asset.symbol,
          name: item.asset.name,
          type: item.asset.type,
          market: item.asset.market,
          exchange: item.asset.exchange,
          indexType: item.asset.indexType,
          fundCompany: item.asset.fundCompany,
          fundType: item.asset.fundType,
          pinyinInitial: item.asset.pinyinInitial,
        },
        groupId: item.groupId,
      })),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    }
  },

  /**
   * 添加标的到分组
   */
  async addToWatchlist(groupId: string, userId: string, data: AddWatchlistItemRequest): Promise<WatchlistItem> {
    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(groupId, userId)
    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    // 验证资产是否存在
    const asset = await assetRepository.findById(data.assetId)
    if (!asset) {
      throw new AppError(ErrorCode.WATCHLIST_ASSET_NOT_FOUND, 404)
    }

    // 检查是否已添加
    const exists = await watchlistRepository.isItemExists(groupId, data.assetId)
    if (exists) {
      throw new AppError(ErrorCode.WATCHLIST_ITEM_EXISTS, 409)
    }

    const item = await watchlistRepository.addItem({
      groupId,
      assetId: data.assetId,
    })

    logger.info({ groupId, assetId: data.assetId }, 'Asset added to watchlist')

    return {
      id: item.id,
      addedAt: item.createdAt.toISOString(),
      asset: {
        id: item.asset.id,
        symbol: item.asset.symbol,
        name: item.asset.name,
        type: item.asset.type,
        market: item.asset.market,
        exchange: item.asset.exchange,
        indexType: item.asset.indexType,
        fundCompany: item.asset.fundCompany,
        fundType: item.asset.fundType,
        pinyinInitial: item.asset.pinyinInitial,
      },
      groupId: item.groupId,
    }
  },

  /**
   * 从分组移除标的
   */
  async removeFromWatchlist(itemId: string, userId: string): Promise<void> {
    // 获取标的详情
    const item = await watchlistRepository.getItemById(itemId)
    if (!item) {
      throw new AppError(ErrorCode.WATCHLIST_ITEM_NOT_FOUND, 404)
    }

    // 验证分组归属
    const isOwner = await watchlistRepository.verifyGroupOwnership(item.groupId, userId)
    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    await watchlistRepository.removeItem(itemId)
    logger.info({ itemId }, 'Asset removed from watchlist')
  },

  /**
   * 批量移除标的
   */
  async batchRemoveFromWatchlist(itemIds: string[], userId: string): Promise<number> {
    logger.info({ userId, count: itemIds.length }, 'Batch removing items from watchlist')

    // 1. 获取所有标的详情并验证归属
    const items = await Promise.all(
      itemIds.map(itemId => watchlistRepository.getItemById(itemId))
    )

    // 2. 检查是否所有标的都存在
    const notFoundIds = itemIds.filter((id, index) => !items[index])
    if (notFoundIds.length > 0) {
      logger.warn({ notFoundIds }, 'Some items not found')
      throw new AppError(ErrorCode.WATCHLIST_ITEM_NOT_FOUND, 404)
    }

    // 3. 验证所有标的的分组归属
    for (const item of items) {
      if (item) {
        const isOwner = await watchlistRepository.verifyGroupOwnership(item.groupId, userId)
        if (!isOwner) {
          logger.warn({ itemId: item.id, userId }, 'User does not own this item')
          throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
        }
      }
    }

    // 4. 批量删除
    const result = await watchlistRepository.batchRemoveItems(itemIds)
    logger.info({ userId, removedCount: result.count }, 'Batch remove completed')

    return result.count
  },


  /**
   * 移动标的到其他分组
   */
  async moveItem(itemId: string, targetGroupId: string, userId: string): Promise<WatchlistItem> {
    // 1. 验证目标分组归属
    const isTargetOwner = await watchlistRepository.verifyGroupOwnership(targetGroupId, userId)
    if (!isTargetOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    // 2. 获取标的详情并验证归属
    const item = await watchlistRepository.getItemById(itemId)
    if (!item) {
      throw new AppError(ErrorCode.WATCHLIST_ITEM_NOT_FOUND, 404)
    } else {
      const isItemOwner = await watchlistRepository.verifyGroupOwnership(item.groupId, userId)
      if (!isItemOwner) {
        throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
      }
    }

    // 3. 检查目标分组是否已存在该标的
    // 注意：item.assetId 是标的的 assetId
    const exists = await watchlistRepository.isItemExists(targetGroupId, item.assetId)
    if (exists) {
      throw new AppError(ErrorCode.WATCHLIST_ITEM_EXISTS, 409)
    }

    // 4. 执行移动
    const movedItem = await watchlistRepository.updateItemGroupId(itemId, targetGroupId)

    logger.info({ itemId, fromGroup: item.groupId, toGroup: targetGroupId }, 'Watchlist item moved')

    return {
      id: movedItem.id,
      addedAt: movedItem.createdAt.toISOString(),
      asset: {
        id: movedItem.asset.id,
        symbol: movedItem.asset.symbol,
        name: movedItem.asset.name,
        type: movedItem.asset.type,
        market: movedItem.asset.market,
        exchange: movedItem.asset.exchange,
        indexType: movedItem.asset.indexType,
        fundCompany: movedItem.asset.fundCompany,
        fundType: movedItem.asset.fundType,
        pinyinInitial: movedItem.asset.pinyinInitial,
      },
      groupId: movedItem.groupId,
    }
  },

  /**
   * 批量移动标的到分组
   */
  async batchMoveItems(userId: string, data: BatchMoveWatchlistItemRequest): Promise<number> {
    const { itemIds, targetGroupId } = data
    logger.info({ userId, count: itemIds.length, targetGroupId }, 'Batch moving items')

    // 1. 验证目标分组归属
    const isTargetOwner = await watchlistRepository.verifyGroupOwnership(targetGroupId, userId)
    if (!isTargetOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    // 2. 获取所有标的详情
    const items = await watchlistRepository.getItemsByIds(itemIds)

    // 3. 验证所有标的归属
    if (items.length !== itemIds.length) {
      throw new AppError(ErrorCode.WATCHLIST_ITEM_NOT_FOUND, 404)
    }

    for (const item of items) {
      if (item.group.userId !== userId) {
        throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
      }
    }

    // 4. 过滤掉已经在目标分组的标的 (无需移动)
    const itemsToProcess = items.filter(item => item.groupId !== targetGroupId)
    if (itemsToProcess.length === 0) {
      return 0
    }

    // 5. 检查目标分组中已存在的 assetIds
    const assetIds = itemsToProcess.map(item => item.assetId)
    const existingAssetIds = await watchlistRepository.getExistingAssetIdsInGroup(targetGroupId, assetIds)
    const existingAssetIdSet = new Set(existingAssetIds)

    // 6. 分类：需要更新的和需要删除的（因为目标已存在）
    const itemsToDelete: string[] = []
    const itemsToUpdate: string[] = []

    for (const item of itemsToProcess) {
      if (existingAssetIdSet.has(item.assetId)) {
        // 目标分组已存在该标的 Asset -> 删除当前 Item
        itemsToDelete.push(item.id)
      } else {
        // 目标分组不存在 -> 移动当前 Item
        itemsToUpdate.push(item.id)
      }
    }

    // 7. 执行操作
    await Promise.all([
      itemsToDelete.length > 0 ? watchlistRepository.batchRemoveItems(itemsToDelete) : Promise.resolve(),
      itemsToUpdate.length > 0 ? watchlistRepository.batchUpdateItemGroup(itemsToUpdate, targetGroupId) : Promise.resolve(),
    ])

    const totalMoved = itemsToDelete.length + itemsToUpdate.length
    logger.info({ userId, totalMoved, deleted: itemsToDelete.length, updated: itemsToUpdate.length }, 'Batch move completed')

    return totalMoved
  },

  /**
   * 获取用户的所有自选标的（跨分组，分页 + 过滤）
   */
  async getAllItems(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: WatchlistFilterQuery
  ): Promise<PaginatedWatchlistResult> {
    const result = await watchlistRepository.getAllItemsByUserId(userId, { page, limit }, filters)

    return {
      data: result.data.map(item => ({
        id: item.id,
        addedAt: item.createdAt.toISOString(),
        asset: {
          id: item.asset.id,
          symbol: item.asset.symbol,
          name: item.asset.name,
          type: item.asset.type,
          market: item.asset.market,
          exchange: item.asset.exchange,
          indexType: item.asset.indexType,
          fundCompany: item.asset.fundCompany,
          fundType: item.asset.fundType,
          pinyinInitial: item.asset.pinyinInitial,
        },
        groupId: item.groupId,
        groupName: item.group.name,
      })),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    }
  },

  /**
   * 批量查询标的所在分组
   */
  async checkAssetGroups(userId: string, assetIds: string[]): Promise<AssetGroupCheckResult[]> {
    logger.info({ userId, assetCount: assetIds.length }, 'Checking asset groups')

    const results = await watchlistRepository.checkAssetGroups(userId, assetIds)

    return results
  },
}
