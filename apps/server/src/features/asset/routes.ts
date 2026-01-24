import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  AssetSearchQuerySchema,
  AssetSearchResultSchema,
} from 'shared'
import { assetService } from './service.js'

const asset = new OpenAPIHono()

// ==================== 标的搜索 ====================

const searchAssetsRoute = createRoute({
  method: 'get',
  path: '/search',
  tags: ['标的搜索'],
  summary: '搜索投资标的',
  description: `
    支持按代码、名称、拼音搜索投资标的。

    **搜索方式**：
    - 代码搜索：\`q=600519\`
    - 名称搜索：\`q=贵州茅台\`
    - 拼音首字母：\`q=ZGMT\`
    - 拼音全拼：\`q=guizhoumaotai\`
    - 基金公司：\`q=易方达\`
  `,
  request: {
    query: AssetSearchQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(AssetSearchResultSchema),
        },
      },
      description: '搜索成功',
    },
  },
})

asset.openapi(searchAssetsRoute, async (c) => {
  const query = c.req.valid('query')
  const result = await assetService.searchByQuery(query)
  return c.json(result)
})

export { asset }
