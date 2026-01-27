# Watchlist 表格服务端排序修复

## 问题描述

原有的 `watchlist-table.tsx` 实现存在一个严重问题：虽然使用了服务端分页，但排序却是在客户端进行的。这导致：

- ❌ 排序只对当前页的 10 条数据生效
- ❌ 无法对所有数据进行全局排序
- ❌ 用户体验不符合预期

## 根本原因

TanStack Table 默认使用客户端模式，之前的实现错误地使用了：
- `getSortedRowModel()` - 客户端排序
- `getFilteredRowModel()` - 客户端过滤
- `getPaginationRowModel()` - 客户端分页

这些功能只适用于所有数据都在客户端的场景。

## 修复内容

### 1. 移除客户端 Row Models

```typescript
// ❌ 之前（错误）
const table = useReactTable({
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(), // 移除
  getSortedRowModel: getSortedRowModel(),         // 移除
  getFilteredRowModel: getFilteredRowModel(),     // 移除
})

// ✅ 现在（正确）
const table = useReactTable({
  getCoreRowModel: getCoreRowModel(),
  // 只保留核心 row model
})
```

### 2. 启用手动模式

```typescript
const table = useReactTable({
  manualPagination: true,  // 启用手动分页
  manualSorting: true,     // 启用手动排序
  manualFiltering: true,   // 启用手动过滤
  pageCount: meta?.totalPages ?? -1,
})
```

### 3. 添加排序状态管理

```typescript
// 在 WatchlistTableProps 中添加
interface WatchlistTableProps {
  // ... 其他 props
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
}

// 在组件中实现
const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
  const newSorting = typeof updaterOrValue === 'function' 
    ? updaterOrValue(sorting) 
    : updaterOrValue
  
  if (onSortingChange) {
    onSortingChange(newSorting) // 通知父组件
  } else {
    setInternalSorting(newSorting)
  }
}
```

### 4. 清理未使用的导入

```typescript
// 移除未使用的类型和函数
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
```

## 后续工作

父组件（`watchlist/page.tsx`）需要：

1. **添加排序状态**：
```typescript
const [sorting, setSorting] = useState<SortingState>([])
```

2. **监听排序变化**：
```typescript
useEffect(() => {
  loadItems() // 重新获取数据
}, [sorting])
```

3. **传递给 API**：
```typescript
const loadItems = async () => {
  const res = await watchlistClient.getItems(
    groupId,
    page,
    pageSize,
    {
      search: filters.search,
      types: filters.types,
      markets: filters.markets,
      sortBy: sorting[0]?.id,        // 新增
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc', // 新增
    }
  )
}
```

4. **传递给表格组件**：
```typescript
<WatchlistTable
  data={result?.data || []}
  meta={result?.meta}
  sorting={sorting}
  onSortingChange={setSorting}
  // ... 其他 props
/>
```

## 后端 API 需要支持

确保后端 API 支持排序参数：

```typescript
GET /api/watchlist/items?page=1&pageSize=10&sortBy=addedAt&sortOrder=desc
```

## 文件变更

- ✅ `apps/web/src/features/watchlist/components/watchlist-table.tsx`
  - 移除客户端 row models
  - 添加手动模式配置
  - 添加排序状态管理
  - 清理未使用的导入

- 📝 `apps/web/src/components/table/IMPLEMENTATION_PLAN.md`
  - 添加服务端 vs 客户端排序的技术说明
  - 更新排序配置接口

## 验证清单

- [ ] 点击列头排序时，应该重新请求 API
- [ ] 排序应该对所有数据生效，不只是当前页
- [ ] 切换页面时，排序状态应该保持
- [ ] 排序状态应该与过滤器和分页正确配合

## 参考资料

- [TanStack Table - Manual Pagination](https://tanstack.com/table/v8/docs/guide/pagination#manual-pagination)
- [TanStack Table - Manual Sorting](https://tanstack.com/table/v8/docs/guide/sorting#manual-sorting)
- [TanStack Table - Manual Filtering](https://tanstack.com/table/v8/docs/guide/filtering#manual-filtering)
