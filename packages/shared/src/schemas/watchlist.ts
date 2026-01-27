import { z } from '@hono/zod-openapi'
import { AssetSearchResultSchema } from './asset.js'

// ==================== 分页相关 Schema ====================

/**
 * 分页元信息 Schema
 */
export const PaginationMetaSchema = z.object({
  /// 总记录数
  total: z.number().int().openapi({
    description: '总记录数',
    example: 100,
  }),
  /// 当前页码
  page: z.number().int().min(1).openapi({
    description: '当前页码',
    example: 1,
  }),
  /// 每页数量
  limit: z.number().int().min(1).max(100).openapi({
    description: '每页数量',
    example: 10,
  }),
  /// 总页数
  totalPages: z.number().int().openapi({
    description: '总页数',
    example: 10,
  }),
}).openapi('PaginationMeta')

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>

/**
 * 分页响应类型（前端使用）
 */
export interface PaginatedResponse<T> {
  /// 数据列表
  data: T[]
  /// 分页元信息
  meta: PaginationMeta
}

// ==================== 分组相关 Schema ====================

/**
 * 创建自选分组请求 Schema
 */
export const CreateWatchlistGroupSchema = z.object({
  /// 分组名称
  name: z.string().min(1).max(50).openapi({
    description: '分组名称 (1-50 个字符)',
    example: '白酒板块',
  }),
}).openapi('CreateWatchlistGroupRequest')

export type CreateWatchlistGroupRequest = z.infer<typeof CreateWatchlistGroupSchema>

/**
 * 更新分组请求 Schema
 */
export const UpdateWatchlistGroupSchema = z.object({
  /// 分组新名称
  name: z.string().min(1).max(50).openapi({
    description: '分组新名称 (1-50 个字符)',
    example: '白酒龙头',
  }),
}).openapi('UpdateWatchlistGroupRequest')

export type UpdateWatchlistGroupRequest = z.infer<typeof UpdateWatchlistGroupSchema>

/**
 * 更新分组排序请求 Schema
 */
export const UpdateGroupSortOrderSchema = z.object({
  /// 新的排序权重（数值越小越靠前）
  sortOrder: z.number().int().openapi({
    description: '排序权重 (数值越小越靠前)',
    example: 0,
  }),
}).openapi('UpdateGroupSortOrderRequest')

export type UpdateGroupSortOrderRequest = z.infer<typeof UpdateGroupSortOrderSchema>

/**
 * 批量调整分组排序请求 Schema
 */
export const ReorderGroupsSchema = z.object({
  /// 分组排序列表
  orders: z.array(z.object({
    /// 分组 ID
    id: z.string().uuid().openapi({ description: '分组 ID' }),
    /// 排序权重
    sortOrder: z.number().int().openapi({ description: '排序权重' }),
  })).openapi({
    description: '分组排序列表',
    example: [
      { id: '550e8400-e29b-41d4-a716-446655440000', sortOrder: 0 },
      { id: '550e8400-e29b-41d4-a716-446655440001', sortOrder: 1 },
    ],
  }),
}).openapi('ReorderGroupsRequest')

export type ReorderGroupsRequest = z.infer<typeof ReorderGroupsSchema>

/**
 * 自选分组响应 Schema
 */
export const WatchlistGroupSchema = z.object({
  /// 分组唯一标识
  id: z.string().uuid().openapi({
    description: '分组唯一标识',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  /// 分组名称
  name: z.string().min(1).max(50).openapi({
    description: '分组名称',
    example: '白酒板块',
  }),
  /// 排序权重
  sortOrder: z.number().int().openapi({
    description: '排序权重 (数值越小越靠前)',
    example: 0,
  }),
  /// 分组内标的数量
  itemCount: z.number().int().openapi({
    description: '分组内标的数量',
    example: 5,
  }),
  /// 创建时间
  createdAt: z.string().datetime().openapi({
    description: '创建时间 (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  }),
  /// 更新时间
  updatedAt: z.string().datetime().openapi({
    description: '更新时间 (ISO 8601)',
    example: '2024-01-20T00:00:00.000Z',
  }),
}).openapi('WatchlistGroup')

export type WatchlistGroup = z.infer<typeof WatchlistGroupSchema>

// ==================== 标的相关 Schema ====================

/**
 * 添加标的到自选分组请求 Schema
 */
export const AddWatchlistItemSchema = z.object({
  /// 标的 ID (从搜索结果获取)
  assetId: z.string().uuid().openapi({
    description: '标的 ID (从搜索结果获取)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
}).openapi('AddWatchlistItemRequest')

export type AddWatchlistItemRequest = z.infer<typeof AddWatchlistItemSchema>

/**
 * 移动标的到其他分组请求 Schema
 */
export const MoveWatchlistItemSchema = z.object({
  /// 目标分组 ID
  targetGroupId: z.string().uuid().openapi({
    description: '目标分组 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
}).openapi('MoveWatchlistItemRequest')

export type MoveWatchlistItemRequest = z.infer<typeof MoveWatchlistItemSchema>

/**
 * 自选标的详情 Schema (嵌套 Asset 信息)
 */
export const WatchlistAssetSchema = AssetSearchResultSchema

/**
 * 自选标的响应 Schema
 */
export const WatchlistItemSchema = z.object({
  /// 记录唯一标识
  id: z.string().uuid().openapi({
    description: '记录唯一标识',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  /// 加入时间
  addedAt: z.string().datetime().openapi({
    description: '加入时间 (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  }),
  /// 资产详情
  asset: WatchlistAssetSchema,
  /// 分组 ID
  groupId: z.string().uuid().openapi({
    description: '分组 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
}).openapi('WatchlistItem')

export type WatchlistItem = z.infer<typeof WatchlistItemSchema>

// ==================== 批量查询相关 Schema ====================

/**
 * 批量查询标的所在分组请求
 */
export interface CheckAssetGroupsRequest {
  /// 资产 ID 列表
  assetIds: string[]
}

/**
 * 标的所在分组检查结果
 */
export const AssetGroupCheckResultSchema = z.object({
  /// 资产 ID
  assetId: z.string().uuid().openapi({
    description: '资产 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  /// 该资产已被添加到的分组 ID 列表
  groupIds: z.array(z.string().uuid()).openapi({
    description: '该资产已被添加到的分组 ID 列表',
    example: ['770e8400-e29b-41d4-a716-446655440002'],
  }),
}).openapi('AssetGroupCheckResult')

export type AssetGroupCheckResult = z.infer<typeof AssetGroupCheckResultSchema>
