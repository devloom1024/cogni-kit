# 前端新增页面开发流程指南

本项目采用 **Feature-First** 架构，即按功能模块组织代码。新增一个前端页面通常遵循以下步骤：

## 1. 目录结构规划
在 `apps/web/src/features/` 下创建新的功能模块目录，结构如下：
```
apps/web/src/features/<feature-name>/
├── api/
│   └── client.ts       # API 请求客户端
├── components/         # 该功能特有的 UI 组件
│   ├── existing-component.tsx
│   └── ...
├── queries.ts          # TanStack Query (React Query) Hooks
└── types.ts            # (可选) 如果 shared 包中没有覆盖的本地类型
```

而在 `apps/web/src/pages/` 下创建页面入口：
```
apps/web/src/pages/<feature-name>/
├── page.tsx            # 主页面组件
└── layout.tsx          # (可选) 页面特定布局
```

## 2. 开发步骤

### 步骤 1: 定义 API Client
在 `features/<feature-name>/api/client.ts` 中封装 Axios 请求。
建议引用 `shared` 包中的 `API_PATHS` 和 TypeScript 类型定义。

```typescript
// features/<feature>/api/client.ts
import { api } from '@/lib/api'
import { API_PATHS } from 'shared'

export const featureClient = {
    getData: async () => {
        const res = await api.get(API_PATHS.SOME_ENDPOINT)
        return res.data
    }
}
```

### 步骤 2: 创建 Query Hooks
在 `features/<feature-name>/queries.ts` 中使用 TanStack Query 封装状态管理。

```typescript
// features/<feature>/queries.ts
import { useQuery } from '@tanstack/react-query'
import { featureClient } from './api/client'

export const featureKeys = {
    all: ['feature'] as const,
    list: () => [...featureKeys.all, 'list'] as const,
}

export const useFeatureData = () => {
    return useQuery({
        queryKey: featureKeys.list(),
        queryFn: featureClient.getData,
    })
}
```

### 步骤 3: 开发业务组件
在 `features/<feature-name>/components/` 中开发该页面所需的特定组件。通用组件应使用 `@/components/ui/`。

### 步骤 4: 组装页面
在 `pages/<feature-name>/page.tsx` 中组装组件，使用 Hooks 获取数据。

```typescript
// pages/<feature>/page.tsx
import { useFeatureData } from '@/features/<feature>/queries'

export function FeaturePage() {
    const { data } = useFeatureData()
    return <div>{/* UI 实现 */}</div>
}
```

### 步骤 5: 配置路由
在 `apps/web/src/App.tsx` 中注册新页面的路由。

```typescript
// App.tsx
<Route element={<AppLayout />}>
    <Route path="feature-path" element={<FeaturePage />} />
</Route>
```

### 步骤 6: 添加侧边栏入口 (可选)
如果需要在左侧菜单显示，修改 `apps/web/src/components/layout/AppSidebar.tsx`。

### 步骤 7: 国际化 (i18n)
修改 `apps/web/src/i18n/locales/` 下的 `zh.json` 和 `en.json`，添加对应功能的翻译文本。

## 3. 最佳实践
- **类型共享**: 尽量复用 `packages/shared` 中的类型定义。
- **组件拆分**: 避免 Page 组件过于庞大，尽量拆分到 `features/<feature>/components`。
- **Hooks 封装**: 所有的 API 调用都应该通过 Hooks (queries.ts) 进行，避免在组件中直接调用 client。
