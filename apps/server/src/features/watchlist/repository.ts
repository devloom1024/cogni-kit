import { prisma } from '../../shared/db.js'
import type { CreateWatchlistGroupRequest, ReorderGroupsRequest, WatchlistFilterQuery } from 'shared'
import type { Prisma } from '@prisma/client'

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 创建分组参数
 */
export interface CreateGroupParams {
  userId: string
  name: string
}

/**
 * 添加标的参数
 */
export interface AddItemParams {
  groupId: string
  assetId: string
}

/**
 * 自选数据访问层
 * 负责自选分组和标的的 CRUD 操作
 */
export const watchlistRepository = {
  // ==================== 分组操作 ====================

  /**
   * 获取用户所有分组（按 sortOrder 排序）
   */
  async getGroups(userId: string) {
    return prisma.watchlistGroup.findMany({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
  },

  /**
   * 根据 ID 获取分组
   */
  async getGroupById(id: string) {
    return prisma.watchlistGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })
  },

  /**
   * 创建分组
   */
  async createGroup(params: CreateGroupParams) {
    // 获取当前最大的 sortOrder
    const maxOrder = await prisma.watchlistGroup.aggregate({
      where: { userId: params.userId },
      _max: { sortOrder: true },
    })

    return prisma.watchlistGroup.create({
      data: {
        userId: params.userId,
        name: params.name,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    })
  },

  /**
   * 创建分组（兼容 OpenAPI Schema）
   */
  async createGroupBySchema(userId: string, schema: CreateWatchlistGroupRequest) {
    return this.createGroup({ userId, name: schema.name })
  },

  /**
   * 更新分组名称
   */
  async updateGroupName(id: string, name: string) {
    return prisma.watchlistGroup.update({
      where: { id },
      data: { name },
    })
  },

  /**
   * 更新分组排序
   */
  async updateGroupSortOrder(id: string, sortOrder: number) {
    return prisma.watchlistGroup.update({
      where: { id },
      data: { sortOrder },
    })
  },

  /**
   * 批量更新分组排序
   */
  async reorderGroups(orders: ReorderGroupsRequest['orders']) {
    return prisma.$transaction(
      orders.map(order =>
        prisma.watchlistGroup.update({
          where: { id: order.id },
          data: { sortOrder: order.sortOrder },
        })
      )
    )
  },

  /**
   * 删除分组（级联删除 items）
   */
  async deleteGroup(id: string) {
    return prisma.watchlistGroup.delete({
      where: { id },
    })
  },

  /**
   * 验证分组归属
   */
  async verifyGroupOwnership(groupId: string, userId: string) {
    const group = await prisma.watchlistGroup.findUnique({
      where: { id: groupId },
      select: { id: true, userId: true },
    })
    return group?.userId === userId
  },

  // ==================== 标的操作 ====================

  /**
   * 获取分组内标的(分页 + 过滤,按添加时间倒序)
   */
  async getItemsByGroupId(
    groupId: string,
    pagination: PaginationParams,
    filters?: WatchlistFilterQuery
  ): Promise<PaginatedResult<Prisma.WatchlistItemGetPayload<{ include: { asset: true } }>>> {
    const { page, limit } = pagination
    const skip = (page - 1) * limit

    // 构建 where 条件
    const where: Prisma.WatchlistItemWhereInput = {
      groupId,
      ...(filters?.search || filters?.types || filters?.markets ? {
        asset: {
          ...(filters.search ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { symbol: { contains: filters.search, mode: 'insensitive' } },
            ],
          } : {}),
          ...(filters.types?.length ? { type: { in: filters.types } } : {}),
          ...(filters.markets?.length ? { market: { in: filters.markets } } : {}),
        },
      } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.watchlistItem.findMany({
        where,
        include: { asset: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.watchlistItem.count({ where }),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * 添加标的到分组
   * 使用 upsert 处理重复添加情况
   */
  async addItem(params: AddItemParams) {
    return prisma.watchlistItem.create({
      data: {
        groupId: params.groupId,
        assetId: params.assetId,
      },
      include: {
        asset: true,
      },
    })
  },

  /**
   * 检查标的是否已在分组中
   */
  async isItemExists(groupId: string, assetId: string) {
    const item = await prisma.watchlistItem.findUnique({
      where: {
        groupId_assetId: {
          groupId,
          assetId,
        },
      },
    })
    return !!item
  },

  /**
   * 从分组移除标的
   */
  async removeItem(itemId: string) {
    return prisma.watchlistItem.delete({
      where: { id: itemId },
    })
  },

  /**
   * 批量移除标的
   */
  async batchRemoveItems(itemIds: string[]) {
    return prisma.watchlistItem.deleteMany({
      where: {
        id: { in: itemIds },
      },
    })
  },


  /**
   * 更新标的所属分组
   */
  async updateItemGroupId(itemId: string, newGroupId: string) {
    return prisma.watchlistItem.update({
      where: { id: itemId },
      data: { groupId: newGroupId },
      include: {
        asset: true,
      },
    })
  },

  /**
   * 获取用户的所有自选标的(跨分组,分页 + 过滤)
   */
  async getAllItemsByUserId(
    userId: string,
    pagination: PaginationParams,
    filters?: WatchlistFilterQuery
  ): Promise<PaginatedResult<Prisma.WatchlistItemGetPayload<{ include: { asset: true; group: { select: { id: true; name: true } } } }>>> {
    const { page, limit } = pagination
    const skip = (page - 1) * limit

    // 构建 where 条件
    const where: Prisma.WatchlistItemWhereInput = {
      group: { userId },
      ...(filters?.search || filters?.types || filters?.markets ? {
        asset: {
          ...(filters.search ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { symbol: { contains: filters.search, mode: 'insensitive' } },
            ],
          } : {}),
          ...(filters.types?.length ? { type: { in: filters.types } } : {}),
          ...(filters.markets?.length ? { market: { in: filters.markets } } : {}),
        },
      } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.watchlistItem.findMany({
        where,
        include: {
          asset: true,
          group: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.watchlistItem.count({ where }),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * 根据 ID 获取自选标的
   */
  async getItemById(itemId: string) {
    return prisma.watchlistItem.findUnique({
      where: { id: itemId },
      include: {
        asset: true,
        group: {
          select: { id: true, userId: true, name: true },
        },
      },
    })
  },

  /**
   * 批量查询标的所在分组
   * 根据资产 ID 列表，返回每个资产已被添加到哪些分组
   */
  async checkAssetGroups(userId: string, assetIds: string[]) {
    // 一次查询获取所有相关记录
    const items = await prisma.watchlistItem.findMany({
      where: {
        assetId: { in: assetIds },
        group: { userId },
      },
      select: {
        assetId: true,
        groupId: true,
      },
    })

    // 内存中按 assetId 分组
    const groupMap = items.reduce((acc, item) => {
      const existing = acc[item.assetId]
      if (existing) {
        existing.push(item.groupId)
      } else {
        acc[item.assetId] = [item.groupId]
      }
      return acc
    }, {} as Record<string, string[]>)

    // 返回结果，保持输入顺序
    return assetIds.map(assetId => ({
      assetId,
      groupIds: groupMap[assetId] || [],
    }))
  },

  /**
   * 批量获取标的详情
   */
  async getItemsByIds(itemIds: string[]) {
    return prisma.watchlistItem.findMany({
      where: {
        id: { in: itemIds },
      },
      include: {
        group: {
          select: { id: true, userId: true },
        },
      },
    })
  },

  /**
   * 批量检查分组内是否已存在指定资产
   * 返回已存在的 assetId 列表
   */
  async getExistingAssetIdsInGroup(groupId: string, assetIds: string[]) {
    const items = await prisma.watchlistItem.findMany({
      where: {
        groupId,
        assetId: { in: assetIds },
      },
      select: {
        assetId: true,
      },
    })
    return items.map(item => item.assetId)
  },

  /**
   * 批量更新标的分组
   */
  async batchUpdateItemGroup(itemIds: string[], newGroupId: string) {
    return prisma.watchlistItem.updateMany({
      where: {
        id: { in: itemIds },
      },
      data: {
        groupId: newGroupId,
      },
    })
  },
}
