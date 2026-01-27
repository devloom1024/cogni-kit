import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  CreateWatchlistGroupSchema,
  UpdateWatchlistGroupSchema,
  UpdateGroupSortOrderSchema,
  ReorderGroupsSchema,
  WatchlistGroupSchema,
  WatchlistItemSchema,
  AddWatchlistItemSchema,
  MoveWatchlistItemSchema,
  ErrorSchema,
  PaginationMetaSchema,
  WatchlistFilterQuerySchema,
} from 'shared'
import { watchlistService } from './service.js'

const watchlist = new OpenAPIHono()

// 分页参数 Schema
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    description: '页码，从 1 开始',
    example: 1,
  }),
  limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    description: '每页数量',
    example: 10,
  }),
})

// 过滤参数 Schema (需要 coerce 处理数组参数)
const filterQuerySchema = z.object({
  search: z.string().min(1).max(50).optional().openapi({
    description: '搜索关键词，支持按标的代码或名称模糊搜索',
    example: '茅台',
  }),
  types: z.preprocess(
    (val) => {
      if (typeof val === 'string') return [val]
      if (Array.isArray(val)) return val
      return undefined
    },
    z.array(z.enum(['STOCK', 'INDEX', 'ETF', 'LOF', 'OFUND'])).optional()
  ).openapi({
    description: '资产类型过滤，支持多选',
    example: ['STOCK', 'ETF'],
  }),
  markets: z.preprocess(
    (val) => {
      if (typeof val === 'string') return [val]
      if (Array.isArray(val)) return val
      return undefined
    },
    z.array(z.enum(['CN', 'HK', 'US'])).optional()
  ).openapi({
    description: '市场过滤，支持多选',
    example: ['CN'],
  }),
})

// 合并分页和过滤参数
const paginationWithFilterQuerySchema = paginationQuerySchema.merge(filterQuerySchema)

// 分页响应 Schema
const paginatedItemsResponseSchema = z.object({
  data: z.array(WatchlistItemSchema),
  meta: PaginationMetaSchema,
}).openapi('PaginatedWatchlistItemsResponse')


// ==================== 自选分组管理 ====================

// 获取我的自选分组列表
const getGroupsRoute = createRoute({
  method: 'get',
  path: '/groups',
  tags: ['自选分组'],
  summary: '获取我的自选分组列表',
  description: '返回用户所有自选分组，包含每个分组的标的数量',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(WatchlistGroupSchema),
        },
      },
      description: '获取成功',
    },
  },
})

watchlist.openapi(getGroupsRoute, async (c) => {
  const userId = c.get('userId')
  const groups = await watchlistService.getGroups(userId)
  return c.json(groups)
})

// 创建自选分组
const createGroupRoute = createRoute({
  method: 'post',
  path: '/groups',
  tags: ['自选分组'],
  summary: '创建自选分组',
  description: '创建新的自选分组',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateWatchlistGroupSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: WatchlistGroupSchema,
        },
      },
      description: '创建成功',
    },
  },
})

watchlist.openapi(createGroupRoute, async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')
  const group = await watchlistService.createGroup(userId, data)
  return c.json(group, 201)
})

// 更新分组信息 (重命名)
const updateGroupRoute = createRoute({
  method: 'put',
  path: '/groups/{groupId}',
  tags: ['自选分组'],
  summary: '更新分组信息',
  description: '重命名分组',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      groupId: z.string().uuid().openapi({ description: '分组 ID' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateWatchlistGroupSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: WatchlistGroupSchema,
        },
      },
      description: '更新成功',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: '分组不存在',
    },
  },
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware
watchlist.openapi(updateGroupRoute, async (c) => {
  const userId = c.get('userId')
  const { groupId } = c.req.param()
  const data = c.req.valid('json')
  const group = await watchlistService.updateGroupName(groupId, userId, data.name)

  if (!group) {
    return c.json({ code: 'auth.user_not_found', message: 'Group not found' }, 404)
  }

  return c.json(group)
})

// 删除分组
const deleteGroupRoute = createRoute({
  method: 'delete',
  path: '/groups/{groupId}',
  tags: ['自选分组'],
  summary: '删除分组',
  description: '删除自选分组。注意：删除分组会同时删除组内所有自选标的。',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      groupId: z.string().uuid().openapi({ description: '分组 ID' }),
    }),
  },
  responses: {
    204: {
      description: '删除成功',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: '分组不存在',
    },
  },
})

watchlist.openapi(deleteGroupRoute, async (c) => {
  const userId = c.get('userId')
  const { groupId } = c.req.param()
  await watchlistService.deleteGroup(groupId, userId)
  return c.body(null, 204)
})

// 调整单个分组排序
const updateGroupSortOrderRoute = createRoute({
  method: 'patch',
  path: '/groups/{groupId}',
  tags: ['自选分组'],
  summary: '调整分组排序',
  description: '调整分组在列表中的显示顺序',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      groupId: z.string().uuid().openapi({ description: '分组 ID' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateGroupSortOrderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: WatchlistGroupSchema,
        },
      },
      description: '更新成功',
    },
  },
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware
watchlist.openapi(updateGroupSortOrderRoute, async (c) => {
  const userId = c.get('userId')
  const { groupId } = c.req.param()
  const data = c.req.valid('json')
  const group = await watchlistService.updateGroupSortOrder(groupId, userId, data.sortOrder)

  if (!group) {
    return c.json({ code: 'auth.user_not_found', message: 'Group not found' }, 404)
  }

  return c.json(group)
})

// 批量调整分组排序
const reorderGroupsRoute = createRoute({
  method: 'patch',
  path: '/groups/reorder',
  tags: ['自选分组'],
  summary: '批量调整分组排序',
  description: '一次更新多个分组的排序',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ReorderGroupsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: '更新成功',
    },
  },
})

watchlist.openapi(reorderGroupsRoute, async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')
  await watchlistService.reorderGroups(userId, data.orders)
  return c.json({ success: true })
})

// ==================== 自选标的管理 ====================

// 获取分组内的自选标的列表
const getItemsRoute = createRoute({
  method: 'get',
  path: '/groups/{groupId}/items',
  tags: ['自选标的'],
  summary: '获取分组内的自选标的列表',
  description: '返回指定分组内的自选标的，按添加时间倒序排列。支持分页查询和过滤。',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      groupId: z.string().uuid().openapi({ description: '分组 ID' }),
    }),
    query: paginationWithFilterQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: paginatedItemsResponseSchema,
        },
      },
      description: '获取成功',
    },
  },
})

watchlist.openapi(getItemsRoute, async (c) => {
  const userId = c.get('userId')
  const { groupId } = c.req.param()
  const { page, limit, search, types, markets } = c.req.valid('query')

  const filters = { search, types, markets }
  const result = await watchlistService.getItemsByGroupId(groupId, userId, page, limit, filters)
  return c.json(result)
})

// 获取用户所有自选标的 (跨分组)
const getAllItemsRoute = createRoute({
  method: 'get',
  path: '/items',
  tags: ['自选标的'],
  summary: '获取所有自选标的',
  description: '返回用户所有自选标的，包含分组信息。支持分页查询和过滤。',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationWithFilterQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: paginatedItemsResponseSchema,
        },
      },
      description: '获取成功',
    },
  },
})

watchlist.openapi(getAllItemsRoute, async (c) => {
  const userId = c.get('userId')
  const { page, limit, search, types, markets } = c.req.valid('query')

  const filters = { search, types, markets }
  const result = await watchlistService.getAllItems(userId, page, limit, filters)
  return c.json(result)
})

// 批量查询标的所在分组
const checkAssetGroupsRoute = createRoute({
  method: 'post',
  path: '/items/check-groups',
  tags: ['自选标的'],
  summary: '批量查询标的所在分组',
  description: '根据资产 ID 批量查询这些资产已被添加到哪些分组。用于搜索弹窗中显示标的的添加状态。',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            assetIds: z.array(z.string().uuid()).max(100).openapi({
              description: '资产 ID 列表',
              example: ['550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001'],
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(z.object({
            assetId: z.string().uuid().openapi({ description: '资产 ID' }),
            groupIds: z.array(z.string().uuid()).openapi({ description: '该资产已被添加到的分组 ID 列表' }),
          })),
        },
      },
      description: '查询成功',
    },
  },
})

watchlist.openapi(checkAssetGroupsRoute, async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')
  const result = await watchlistService.checkAssetGroups(userId, data.assetIds)
  return c.json(result)
})

// 添加标的到自选分组
const addItemRoute = createRoute({
  method: 'post',
  path: '/groups/{groupId}/items',
  tags: ['自选标的'],
  summary: '添加标的到自选分组',
  description: '将指定标的添加到自选分组',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      groupId: z.string().uuid().openapi({ description: '分组 ID' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: AddWatchlistItemSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: WatchlistItemSchema,
        },
      },
      description: '添加成功',
    },
    409: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: '标的已存在于该分组',
    },
  },
})

watchlist.openapi(addItemRoute, async (c) => {
  const userId = c.get('userId')
  const { groupId } = c.req.param()
  const data = c.req.valid('json')
  const item = await watchlistService.addToWatchlist(groupId, userId, data)
  return c.json(item, 201)
})

// 从自选移除
const removeItemRoute = createRoute({
  method: 'delete',
  path: '/items/{itemId}',
  tags: ['自选标的'],
  summary: '从自选移除',
  description: '将标的从自选列表中移除',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      itemId: z.string().uuid().openapi({ description: '自选记录 ID' }),
    }),
  },
  responses: {
    204: {
      description: '移除成功',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: '记录不存在',
    },
  },
})

watchlist.openapi(removeItemRoute, async (c) => {
  const userId = c.get('userId')
  const { itemId } = c.req.param()
  await watchlistService.removeFromWatchlist(itemId, userId)
  return c.body(null, 204)
})

// 批量移除标的
const batchRemoveItemsRoute = createRoute({
  method: 'post',
  path: '/items/batch-remove',
  tags: ['自选标的'],
  summary: '批量移除标的',
  description: '批量将标的从自选列表中移除',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            itemIds: z.array(z.string().uuid()).min(1).max(100).openapi({
              description: '自选记录 ID 列表 (最多 100 条)',
              example: ['550e8400-e29b-41d4-a716-446655440000'],
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            count: z.number().int().openapi({
              description: '成功移除的数量',
              example: 3,
            }),
          }),
        },
      },
      description: '移除成功',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: '部分或全部记录不存在',
    },
  },
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware
watchlist.openapi(batchRemoveItemsRoute, async (c) => {
  const userId = c.get('userId')
  const { itemIds } = c.req.valid('json')
  const count = await watchlistService.batchRemoveFromWatchlist(itemIds, userId)
  return c.json({ count })
})



// 移动标的到其他分组
const moveItemRoute = createRoute({
  method: 'patch',
  path: '/items/{itemId}/move',
  tags: ['自选标的'],
  summary: '移动标的到其他分组',
  description: '将标的从当前分组移动到目标分组',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      itemId: z.string().uuid().openapi({ description: '自选记录 ID' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: MoveWatchlistItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: WatchlistItemSchema,
        },
      },
      description: '移动成功',
    },
    409: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: '目标分组已存在该标的',
    },
  },
})

// @ts-expect-error - Hono OpenAPI types don't support error responses handled by errorHandler middleware
watchlist.openapi(moveItemRoute, async (c) => {
  const userId = c.get('userId')
  const { itemId } = c.req.param()
  const data = c.req.valid('json')
  const item = await watchlistService.moveItem(itemId, data.targetGroupId, userId)
  return c.json(item)
})

export { watchlist }
