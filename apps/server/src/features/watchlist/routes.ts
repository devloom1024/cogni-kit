import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  CreateWatchlistGroupSchema,
  UpdateWatchlistGroupSchema,
  UpdateGroupSortOrderSchema,
  ReorderGroupsSchema,
  WatchlistGroupSchema,
  WatchlistItemSchema,
  AddWatchlistItemSchema,
  ErrorSchema,
} from 'shared'
import { watchlistService } from './service.js'

const watchlist = new OpenAPIHono()

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
  description: '返回指定分组内的所有自选标的，按添加时间倒序排列',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      groupId: z.string().uuid().openapi({ description: '分组 ID' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(WatchlistItemSchema),
        },
      },
      description: '获取成功',
    },
  },
})

watchlist.openapi(getItemsRoute, async (c) => {
  const userId = c.get('userId')
  const { groupId } = c.req.param()
  const items = await watchlistService.getItemsByGroupId(groupId, userId)
  return c.json(items)
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

export { watchlist }
