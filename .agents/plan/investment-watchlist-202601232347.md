# 实施计划 - 投资自选功能

**创建时间**: 2026-01-23 23:47
**版本**: v1.0.0

---

## 概述

本计划描述投资自选功能的技术实施步骤，包括 financial-data 数据采集、数据库迁移、后端 API 实现和前端集成。

### 目标
- 实现投资标的搜索功能
- 实现自选分组 CRUD 功能
- 实现自选标的添加/移除功能

---

## Phase 0: financial-data 数据采集服务 (Python)

### 0.1 akshare 依赖配置

**任务**:
- [x] 确认 `services/financial-data` 目录结构
- [x] 安装 `akshare` 依赖

### 0.2 API 实现

**任务**:
- [x] 实现 `/api/v1/akshare/stock/list` - A股列表 (symbol, name, market)
- [x] 实现 `/api/v1/akshare/index/list` - 指数列表 (symbol, name, market)
- [x] 实现 `/api/v1/akshare/etf/list` - ETF列表 (symbol, name, market)
- [x] 实现 `/api/v1/akshare/lof/list` - LOF列表 (symbol, name, market)
- [x] 实现 `/api/v1/akshare/fund/list` - 场外基金列表 (symbol, name, fundType, pinyinInitial, pinyinFull)

### 0.3 数据处理

**任务**:
- [x] 场外基金：中文 fundType 转枚举 (货币型→MONEY, 债券型→BOND, 等)
- [x] 场外基金：拼音缩写转 pinyinInitial
- [x] 场外基金：拼音全称转 pinyinFull

### 0.4 测试验证

**任务**:
- [ ] 验证各接口返回数据正确性
- [ ] 验证 fundType 映射正确性

---

## Phase 1: 数据库与后端基础设施

### 1.1 数据库迁移

**任务**:
- [x] 运行 `bunx prisma migrate dev --name init_watchlist_tables` 生成迁移文件
- [x] 应用迁移到开发数据库
- [x] 验证迁移脚本正确性

**输出**:
- `prisma/migrations/20260117081456_init/` 目录（已存在，表结构在 schema 中定义）

### 1.2 Shared Schema 定义

**任务**:
- [x] 创建 `packages/shared/src/schemas/asset.ts` 定义 Asset 相关类型
- [x] 创建 `packages/shared/src/schemas/watchlist.ts` 定义自选相关类型
- [x] 导出类型供前后端使用
- [x] 更新 `packages/shared/src/constants/index.ts` 添加 API_PATHS

**文件结构**:
```
packages/shared/src/schemas/
├── asset.ts        # AssetSearchResult, AssetSearchQuery 等
├── watchlist.ts    # WatchlistGroup, WatchlistItem 等
└── index.ts        # 统一导出 (已更新)
```

### 1.3 后端 Repository 层

**任务**:
- [x] 创建 `apps/server/src/features/asset/repository.ts` (Asset 查询)
- [x] 创建 `apps/server/src/features/watchlist/repository.ts` (自选数据访问)

**职责**:
- AssetRepository: 标的搜索、分页查询
- WatchlistRepository: 分组/标的的 CRUD 操作

---

## Phase 2: 后端 Service 层

### 2.1 Asset Service

**任务**:
- [x] 创建 `apps/server/src/features/asset/service.ts`
- [x] 实现 `searchAssets(query, filters)` 方法
- [x] 实现模糊搜索逻辑（代码/名称/拼音/基金公司）

### 2.2 Watchlist Service

**任务**:
- [x] 创建 `apps/server/src/features/watchlist/service.ts`
- [x] 实现 `getGroups(userId)` 方法
- [x] 实现 `createGroup(userId, name)` 方法
- [x] 实现 `addToWatchlist(groupId, assetId)` 方法
- [x] 实现 `removeFromWatchlist(itemId)` 方法
- [x] 实现分组排序功能
- [x] 实现所有权验证

---

## Phase 3: 后端 Controller/路由层 ✅ 已完成

### 3.1 标的搜索路由

**任务**:
- [x] 创建 `apps/server/src/features/asset/routes.ts`
- [x] 实现 `GET /api/v1/assets/search` 路由

### 3.2 自选分组路由

**任务**:
- [x] 创建 `apps/server/src/features/watchlist/routes.ts`
- [x] 实现 `GET /api/v1/watchlist/groups` 路由
- [x] 实现 `POST /api/v1/watchlist/groups` 路由
- [x] 实现 `PUT /api/v1/watchlist/groups/:id` 路由
- [x] 实现 `DELETE /api/v1/watchlist/groups/:id` 路由
- [x] 实现 `PATCH /api/v1/watchlist/groups/reorder` 路由

### 3.3 自选标的路由

**任务**:
- [x] 实现 `GET /api/v1/watchlist/groups/:id/items` 路由
- [x] 实现 `POST /api/v1/watchlist/groups/:id/items` 路由
- [x] 实现 `DELETE /api/v1/watchlist/items/:id` 路由

### 3.4 路由注册

**任务**:
- [x] 在 `apps/server/src/main.ts` 中注册所有路由

---

## Phase 4: 前端基础设施

### 4.1 Shared 常量定义

**任务**:
- [ ] 在 `packages/shared/src/constants/index.ts` 添加投资相关 API_PATHS

```typescript
// 示例
export const API_PATHS = {
  // ... 现有路径
  ASSET_SEARCH: '/api/v1/assets/search',
  WATCHLIST_GROUPS: '/api/v1/watchlist/groups',
  WATCHLIST_GROUP_ITEMS: (groupId: string) => `/api/v1/watchlist/groups/${groupId}/items`,
  WATCHLIST_ITEM: (itemId: string) => `/api/v1/watchlist/items/${itemId}`,
}
```

### 4.2 API 客户端

**任务**:
- [ ] 创建 `apps/web/src/lib/asset-client.ts` (标的搜索 API)
- [ ] 创建 `apps/web/src/lib/watchlist-client.ts` (自选管理 API)

**文件结构**:
```
apps/web/src/lib/
├── api.ts             # 基础 axios 客户端 (已存在)
├── asset-client.ts    # 标的搜索
└── watchlist-client.ts # 自选管理
```

**asset-client.ts 示例**:
```typescript
import { api } from './api'
import { API_PATHS } from 'shared'
import type { AssetSearchResult } from 'shared'

export const assetClient = {
    search: async (query: string, type?: string) => {
        const params = new URLSearchParams({ q: query })
        if (type) params.append('type', type)
        const res = await api.get<AssetSearchResult[]>(
            `${API_PATHS.ASSET_SEARCH}?${params}`
        )
        return res.data
    },
}
```

**watchlist-client.ts 示例**:
```typescript
import { api } from './api'
import { API_PATHS } from 'shared'
import type { WatchlistGroup, WatchlistItem } from 'shared'

export const watchlistClient = {
    getGroups: async () => {
        const res = await api.get<WatchlistGroup[]>(API_PATHS.WATCHLIST_GROUPS)
        return res.data
    },

    createGroup: async (name: string) => {
        const res = await api.post<WatchlistGroup>(API_PATHS.WATCHLIST_GROUPS, { name })
        return res.data
    },

    addToGroup: async (groupId: string, assetId: string) => {
        const res = await api.post<WatchlistItem>(
            API_PATHS.WATCHLIST_GROUP_ITEMS(groupId),
            { assetId }
        )
        return res.data
    },

    removeFromGroup: async (itemId: string) => {
        await api.delete(API_PATHS.WATCHLIST_ITEM(itemId))
    },
}
```

### 4.3 类型导入

**任务**:
- [ ] 从 `shared` 导入 Asset, WatchlistGroup, WatchlistItem 类型
- [ ] 确保前后端类型一致

---

## Phase 5: 前端组件开发

### 5.1 标的搜索组件

**任务**:
- [ ] 创建 `apps/web/src/features/watchlist/components/asset-search.tsx`
- [ ] 实现搜索输入框
- [ ] 实现搜索结果列表
- [ ] 实现添加到自选功能

### 5.2 分组管理组件

**任务**:
- [ ] 创建 `apps/web/src/features/watchlist/components/group-list.tsx`
- [ ] 创建 `apps/web/src/features/watchlist/components/group-item.tsx`
- [ ] 实现分组列表展示
- [ ] 实现分组添加/重命名/删除

### 5.3 自选列表组件

**任务**:
- [ ] 创建 `apps/web/src/features/watchlist/components/watchlist.tsx`
- [ ] 创建 `apps/web/src/features/watchlist/components/watchlist-item.tsx`
- [ ] 实现分组内标的列表（按添加时间倒序）
- [ ] 实现删除标的功能

### 5.4 页面集成

**任务**:
- [ ] 创建 `apps/web/src/features/watchlist/page.tsx`
- [ ] 集成搜索、分组管理、自选列表组件
- [ ] 实现组件间状态联动

---

## Phase 6: 测试与验证

### 6.1 后端测试

**任务**:
- [ ] 编写 Repository 层单元测试
- [ ] 编写 Service 层单元测试
- [ ] 编写 API 集成测试 (使用 Supertest)

### 6.2 前端测试

**任务**:
- [ ] 编写关键组件单元测试
- [ ] 验证 API 集成正确性

### 6.3 手动验证

**任务**:
- [ ] 使用 Swagger UI 测试所有 API
- [ ] 测试搜索功能的准确性
- [ ] 测试添加/移除自选的流程
- [ ] 测试分组排序功能

---

## 依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│               Phase 0: financial-data 数据采集               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  akshare 接口实现 + fundType 映射 + 拼音处理          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 1: 数据库与基础设施                  │
│  ┌──────────────┐  ┌──────────────────────┐                │
│  │ Prisma 迁移  │→ │ Shared Schema 定义   │                │
│  └──────────────┘  └──────────────────────┘                │
│                           ↓                                 │
│  ┌──────────────────────────────────────┐                  │
│  │      Repository 层实现               │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 2-3: 后端实现                       │
│  ┌──────────────┐  ┌──────────────────────┐                │
│  │ Asset Service│→ │ Watchlist Service    │                │
│  └──────────────┘  └──────────────────────┘                │
│                           ↓                                 │
│  ┌──────────────────────────────────────┐                  │
│  │      路由实现 (routes.ts)            │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 4-5: 前端实现                       │
│  ┌──────────────┐  ┌──────────────────────┐                │
│  │ API 客户端   │→ │      组件开发         │                │
│  └──────────────┘  └──────────────────────┘                │
│                           ↓                                 │
│  ┌──────────────────────────────────────┐                  │
│  │      页面集成与状态管理               │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 6: 测试与验证                       │
│  ┌──────────────┐  ┌──────────────────────┐                │
│  │ 后端测试     │→ │      前端测试         │                │
│  └──────────────┘  └──────────────────────┘                │
│                           ↓                                 │
│  ┌──────────────────────────────────────┐                  │
│  │      手动验证与修复                   │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 风险与注意事项

| 风险 | 缓解措施 |
|------|----------|
| 搜索性能（大量数据） | 添加索引、限制返回数量 |
| 重复添加标的 | 使用 `@@unique([groupId, assetId])` 约束 |
| 并发冲突 | 使用事务和乐观锁 |
| 用户数据隔离 | 确保每个 API 校验 userId |

---

## 验收标准

### 功能验收
- [ ] 标的搜索返回正确结果
- [ ] 可以创建/重命名/删除分组
- [ ] 可以将标的添加到指定分组
- [ ] 同一标的不能重复添加到同一分组
- [ ] 可以从自选移除标的

### 代码验收
- [ ] 遵循 Clean Architecture 分层
- [ ] 前后端类型一致
- [ ] API 文档与实现一致
- [ ] 单元测试覆盖率 > 70%
