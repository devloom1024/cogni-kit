# 通用增强版表格组件封装计划

## 一、现状分析

### 1.1 当前实现概览

当前 `watchlist-table.tsx` 实现了一个功能丰富的表格，包含以下特性：

**核心功能：**
- ✅ 基于 TanStack Table (React Table v8) 实现
- ✅ 服务端分页支持（通过 meta 数据）
- ✅ 列排序功能
- ✅ 列可见性控制
- ✅ 行选择（单选/全选）
- ✅ 批量操作（批量删除）
- ✅ 过滤器集成（搜索、类型、市场）
- ✅ 加载状态展示
- ✅ 空状态展示
- ✅ 行操作菜单

**UI/UX 增强：**
- ✅ Framer Motion 动画效果
- ✅ 批量操作栏动画切换
- ✅ 确认对话框
- ✅ 响应式分页组件
- ✅ 国际化支持

### 1.2 代码结构分析

```
watchlist/components/
├── watchlist-table.tsx      # 主表格组件 (427行)
├── columns.tsx               # 列定义 (120行)
├── row-actions.tsx           # 行操作 (69行)
└── watchlist-filters.tsx     # 过滤器 (127行)
```

### 1.3 耦合度分析

**高耦合部分（需要解耦）：**
- 列定义与业务数据强绑定（WatchlistItem 类型）
- 行操作直接调用 watchlistClient API
- 过滤器选项硬编码（ASSET_TYPES, MARKETS）
- 国际化 key 与 watchlist 业务绑定

**可复用部分（可直接提取）：**
- 表格状态管理逻辑
- 分页计算逻辑
- 批量操作 UI 模式
- 加载/空状态展示
- 列可见性控制
- 动画效果

---

## 二、封装目标

### 2.1 设计原则

1. **高度可配置**：通过 props 控制所有功能开关
2. **类型安全**：完整的 TypeScript 泛型支持
3. **零业务耦合**：不依赖任何特定业务逻辑
4. **渐进式增强**：基础功能 + 可选增强功能
5. **保持简单**：API 设计简洁直观

### 2.2 功能范围

**核心功能（必须）：**
- ✅ 表格渲染（基于 TanStack Table）
- ✅ 服务端分页
- ✅ 加载/空状态
- ✅ 列定义支持

**增强功能（可选）：**
- ✅ 行选择（单选/多选）
- ✅ 批量操作栏
- ✅ 列可见性控制
- ✅ 排序支持
- ✅ 过滤器集成
- ✅ 动画效果
- ✅ 行操作菜单

---

## 三、组件架构设计

### 3.1 组件层级结构

```
apps/web/src/components/table/
├── index.ts                          # 导出入口
├── types.ts                          # 类型定义
├── hooks/
│   ├── use-table-state.ts           # 表格状态管理 Hook
│   ├── use-pagination.ts            # 分页逻辑 Hook
│   └── use-row-selection.ts         # 行选择逻辑 Hook
├── components/
│   ├── enhanced-table.tsx           # 主表格组件
│   ├── table-toolbar.tsx            # 工具栏（过滤器 + 列控制）
│   ├── table-content.tsx            # 表格内容区域
│   ├── table-pagination.tsx         # 分页组件
│   ├── batch-action-bar.tsx         # 批量操作栏
│   ├── table-loading.tsx            # 加载状态
│   ├── table-empty.tsx              # 空状态
│   └── column-visibility-menu.tsx   # 列可见性菜单
└── utils/
    ├── pagination-helpers.ts        # 分页计算工具
    └── table-helpers.ts             # 表格辅助函数
```

### 3.2 核心类型定义

```typescript
// types.ts

import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

/**
 * 分页元数据
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 批量操作配置
 */
export interface BatchAction<TData> {
  key: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  onClick: (selectedRows: TData[]) => void | Promise<void>
  confirmDialog?: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
  }
}

/**
 * 过滤器配置
 */
export interface FilterConfig {
  key: string
  label: string
  type: 'search' | 'select' | 'multi-select' | 'date-range'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  searchable?: boolean
  clearable?: boolean
}

/**
 * 空状态配置
 */
export interface EmptyStateConfig {
  icon?: ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * 表格配置
 */
export interface EnhancedTableConfig<TData> {
  // 核心配置
  columns: ColumnDef<TData>[]
  data: TData[]
  
  // 分页配置
  pagination?: {
    meta?: PaginationMeta
    onPageChange?: (page: number) => void
    showTotal?: boolean
    showPageSize?: boolean
    pageSizeOptions?: number[]
  }
  
  // 选择配置
  selection?: {
    enabled: boolean
    mode?: 'single' | 'multiple'
    onSelectionChange?: (selectedRows: TData[]) => void
  }
  
  // 批量操作配置
  batchActions?: BatchAction<TData>[]
  
  // 过滤器配置
  filters?: {
    configs: FilterConfig[]
    values: Record<string, any>
    onChange: (filters: Record<string, any>) => void
  }
  
  // 排序配置
  sorting?: {
    enabled: boolean
    mode?: 'client' | 'server' // 排序模式：客户端或服务端
    state?: SortingState
    onSortingChange?: (sorting: SortingState) => void
  }
  
  // 列可见性配置
  columnVisibility?: {
    enabled: boolean
    state?: VisibilityState
    onVisibilityChange?: (visibility: VisibilityState) => void
  }
  
  // 状态配置
  loading?: boolean
  emptyState?: EmptyStateConfig
  
  // 动画配置
  animations?: {
    enabled: boolean
    batchActionBar?: boolean
  }
  
  // 样式配置
  className?: string
  tableClassName?: string
}
```

---

### 3.3 重要技术说明：服务端 vs 客户端排序/过滤/分页

**⚠️ 关键点：对于服务端分页的表格，必须使用手动模式！**

#### 问题背景

TanStack Table 默认提供客户端的排序、过滤和分页功能。但是当数据来自服务端分页时，这些客户端功能会导致错误的行为：

- **客户端排序**：只会对当前页的数据排序，而不是全部数据
- **客户端过滤**：只会过滤当前页的数据
- **客户端分页**：会基于当前数据重新分页，导致分页信息不准确

#### 正确的实现方式

对于服务端分页的表格，必须：

1. **启用手动模式**：
```typescript
const table = useReactTable({
  data,
  columns,
  // ✅ 启用手动模式
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  
  // ✅ 只使用 getCoreRowModel
  getCoreRowModel: getCoreRowModel(),
  
  // ❌ 不要使用这些 row models
  // getPaginationRowModel: getPaginationRowModel(),
  // getSortedRowModel: getSortedRowModel(),
  // getFilteredRowModel: getFilteredRowModel(),
  
  // ✅ 提供服务端的分页信息
  pageCount: meta?.totalPages ?? -1,
  
  // ✅ 监听状态变化，通知服务端
  onSortingChange: handleSortingChange,
  onPaginationChange: handlePaginationChange,
  
  state: {
    sorting,
    pagination,
  },
})
```

2. **处理状态变化**：
```typescript
// 排序变化时，通知父组件重新获取数据
const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
  const newSorting = typeof updaterOrValue === 'function' 
    ? updaterOrValue(sorting) 
    : updaterOrValue
  
  if (onSortingChange) {
    onSortingChange(newSorting) // 父组件会重新调用 API
  } else {
    setInternalSorting(newSorting)
  }
}
```

3. **父组件响应变化**：
```typescript
function WatchlistPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  
  // 当排序变化时，重新获取数据
  useEffect(() => {
    fetchItems({
      page,
      pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    })
  }, [sorting, page, pageSize])
  
  return (
    <WatchlistTable
      data={items}
      meta={meta}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}
```

#### 配置选项

为了支持不同场景，我们的通用表格组件将提供 `mode` 配置：

```typescript
sorting?: {
  enabled: boolean
  mode?: 'client' | 'server' // 默认 'server'
  state?: SortingState
  onSortingChange?: (sorting: SortingState) => void
}
```

- **`mode: 'server'`**（推荐）：适用于服务端分页场景
  - 启用 `manualSorting: true`
  - 不使用 `getSortedRowModel()`
  - 需要提供 `onSortingChange` 回调
  
- **`mode: 'client'`**：适用于客户端分页场景
  - 启用 `manualSorting: false`
  - 使用 `getSortedRowModel()`
  - 所有数据都在客户端

#### 当前 Watchlist 实现的修复

已修复的问题：
- ✅ 移除了 `getSortedRowModel()`
- ✅ 移除了 `getFilteredRowModel()`
- ✅ 移除了 `getPaginationRowModel()`
- ✅ 添加了 `manualPagination: true`
- ✅ 添加了 `manualSorting: true`
- ✅ 添加了 `manualFiltering: true`
- ✅ 添加了 `sorting` 和 `onSortingChange` props
- ✅ 正确处理 Updater 函数

---

## 四、详细实现计划

### 4.1 阶段一：基础架构（优先级：高）

#### 任务 1.1：创建类型定义
**文件：** `types.ts`
**内容：**
- 定义所有核心类型接口
- 导出泛型类型工具

#### 任务 1.2：创建工具函数
**文件：** `utils/pagination-helpers.ts`
```typescript
// 分页页码计算
export function calculatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): (number | 'ellipsis')[]

// 分页范围计算
export function getPaginationRange(
  page: number,
  pageSize: number,
  total: number
): { from: number; to: number }
```

**文件：** `utils/table-helpers.ts`
```typescript
// 获取选中行数据
export function getSelectedRowsData<TData>(
  table: Table<TData>
): TData[]

// 列可见性状态转换
export function getVisibleColumns<TData>(
  columns: ColumnDef<TData>[],
  visibility: VisibilityState
): ColumnDef<TData>[]
```

### 4.2 阶段二：核心 Hooks（优先级：高）

#### 任务 2.1：表格状态管理 Hook
**文件：** `hooks/use-table-state.ts`
```typescript
export function useTableState<TData>(config: EnhancedTableConfig<TData>) {
  // 管理所有表格状态
  // - sorting
  // - columnFilters
  // - columnVisibility
  // - rowSelection
  
  // 返回 TanStack Table 实例
  return {
    table,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    handlers: {
      setSorting,
      setColumnFilters,
      setColumnVisibility,
      setRowSelection,
    }
  }
}
```

#### 任务 2.2：分页逻辑 Hook
**文件：** `hooks/use-pagination.ts`
```typescript
export function usePagination(meta?: PaginationMeta) {
  // 计算页码数组
  // 处理页面跳转
  // 返回分页相关状态和方法
  
  return {
    pageNumbers,
    canPrevious,
    canNext,
    handlePageChange,
    paginationRange,
  }
}
```

#### 任务 2.3：行选择逻辑 Hook
**文件：** `hooks/use-row-selection.ts`
```typescript
export function useRowSelection<TData>(
  table: Table<TData>,
  config?: SelectionConfig
) {
  // 管理行选择状态
  // 提供选择相关方法
  
  return {
    selectedRows,
    hasSelection,
    clearSelection,
    selectAll,
    toggleRow,
  }
}
```

### 4.3 阶段三：UI 子组件（优先级：中）

#### 任务 3.1：批量操作栏
**文件：** `components/batch-action-bar.tsx`
```typescript
interface BatchActionBarProps<TData> {
  selectedCount: number
  actions: BatchAction<TData>[]
  selectedRows: TData[]
  onClearSelection: () => void
  animated?: boolean
}

export function BatchActionBar<TData>(props: BatchActionBarProps<TData>) {
  // 渲染批量操作栏
  // 支持动画切换
  // 处理确认对话框
}
```

#### 任务 3.2：工具栏
**文件：** `components/table-toolbar.tsx`
```typescript
interface TableToolbarProps {
  filters?: FilterConfig[]
  filterValues?: Record<string, any>
  onFiltersChange?: (filters: Record<string, any>) => void
  columnVisibilityMenu?: ReactNode
  customActions?: ReactNode
}

export function TableToolbar(props: TableToolbarProps) {
  // 渲染过滤器
  // 渲染列可见性菜单
  // 支持自定义操作按钮
}
```

#### 任务 3.3：列可见性菜单
**文件：** `components/column-visibility-menu.tsx`
```typescript
interface ColumnVisibilityMenuProps<TData> {
  table: Table<TData>
  label?: string
  getColumnLabel?: (columnId: string) => string
}

export function ColumnVisibilityMenu<TData>(props: ColumnVisibilityMenuProps<TData>) {
  // 渲染列可见性下拉菜单
}
```

#### 任务 3.4：分页组件
**文件：** `components/table-pagination.tsx`
```typescript
interface TablePaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  showTotal?: boolean
  totalLabel?: string
  previousLabel?: string
  nextLabel?: string
}

export function TablePagination(props: TablePaginationProps) {
  // 渲染分页控件
  // 使用 usePagination hook
}
```

#### 任务 3.5：加载状态
**文件：** `components/table-loading.tsx`
```typescript
interface TableLoadingProps {
  loading: boolean
  children: ReactNode
}

export function TableLoading({ loading, children }: TableLoadingProps) {
  // 渲染加载遮罩层
}
```

#### 任务 3.6：空状态
**文件：** `components/table-empty.tsx`
```typescript
interface TableEmptyProps {
  config?: EmptyStateConfig
  columnCount: number
}

export function TableEmpty({ config, columnCount }: TableEmptyProps) {
  // 渲染空状态
}
```

#### 任务 3.7：表格内容
**文件：** `components/table-content.tsx`
```typescript
interface TableContentProps<TData> {
  table: Table<TData>
  loading?: boolean
  emptyState?: EmptyStateConfig
}

export function TableContent<TData>(props: TableContentProps<TData>) {
  // 渲染表格头部和主体
  // 集成加载和空状态
}
```

### 4.4 阶段四：主组件（优先级：高）

#### 任务 4.1：增强表格主组件
**文件：** `components/enhanced-table.tsx`
```typescript
export function EnhancedTable<TData>(config: EnhancedTableConfig<TData>) {
  // 1. 使用 useTableState 初始化表格
  const { table, state, handlers } = useTableState(config)
  
  // 2. 使用 useRowSelection 管理选择
  const selection = useRowSelection(table, config.selection)
  
  // 3. 使用 usePagination 管理分页
  const pagination = usePagination(config.pagination?.meta)
  
  // 4. 渲染组件结构
  return (
    <div className={config.className}>
      {/* 工具栏区域 */}
      <div className="relative">
        {/* 默认工具栏 */}
        {!selection.hasSelection && (
          <TableToolbar
            filters={config.filters}
            columnVisibilityMenu={
              config.columnVisibility?.enabled && (
                <ColumnVisibilityMenu table={table} />
              )
            }
          />
        )}
        
        {/* 批量操作栏 */}
        {selection.hasSelection && config.batchActions && (
          <BatchActionBar
            selectedCount={selection.selectedRows.length}
            actions={config.batchActions}
            selectedRows={selection.selectedRows}
            onClearSelection={selection.clearSelection}
            animated={config.animations?.batchActionBar}
          />
        )}
      </div>
      
      {/* 表格内容 */}
      <TableLoading loading={config.loading}>
        <TableContent
          table={table}
          loading={config.loading}
          emptyState={config.emptyState}
        />
      </TableLoading>
      
      {/* 分页 */}
      {config.pagination?.meta && (
        <TablePagination
          meta={config.pagination.meta}
          onPageChange={config.pagination.onPageChange}
          showTotal={config.pagination.showTotal}
        />
      )}
    </div>
  )
}
```

### 4.5 阶段五：导出和文档（优先级：中）

#### 任务 5.1：创建导出入口
**文件：** `index.ts`
```typescript
// 主组件
export { EnhancedTable } from './components/enhanced-table'

// 子组件（可选单独使用）
export { BatchActionBar } from './components/batch-action-bar'
export { TableToolbar } from './components/table-toolbar'
export { TablePagination } from './components/table-pagination'
export { ColumnVisibilityMenu } from './components/column-visibility-menu'

// Hooks
export { useTableState } from './hooks/use-table-state'
export { usePagination } from './hooks/use-pagination'
export { useRowSelection } from './hooks/use-row-selection'

// 类型
export type * from './types'

// 工具函数
export * from './utils/pagination-helpers'
export * from './utils/table-helpers'
```

#### 任务 5.2：创建使用文档
**文件：** `README.md`
- 快速开始示例
- API 文档
- 高级用法
- 迁移指南

---

## 五、使用示例

### 5.1 基础用法

```typescript
import { EnhancedTable } from '@/components/table'
import type { ColumnDef } from '@tanstack/react-table'

interface User {
  id: string
  name: string
  email: string
}

function UsersTable() {
  const [data, setData] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta>()
  const [loading, setLoading] = useState(false)
  
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ]
  
  return (
    <EnhancedTable
      columns={columns}
      data={data}
      loading={loading}
      pagination={{
        meta,
        onPageChange: (page) => fetchUsers(page),
        showTotal: true,
      }}
    />
  )
}
```

### 5.2 完整功能用法

```typescript
import { EnhancedTable } from '@/components/table'
import type { EnhancedTableConfig } from '@/components/table'

function AdvancedTable() {
  const config: EnhancedTableConfig<WatchlistItem> = {
    columns: useWatchlistColumns(),
    data: items,
    loading: isLoading,
    
    // 分页
    pagination: {
      meta: paginationMeta,
      onPageChange: handlePageChange,
      showTotal: true,
    },
    
    // 行选择
    selection: {
      enabled: true,
      mode: 'multiple',
      onSelectionChange: (rows) => console.log(rows),
    },
    
    // 批量操作
    batchActions: [
      {
        key: 'delete',
        label: t('common.delete'),
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive',
        onClick: async (rows) => {
          await batchDelete(rows.map(r => r.id))
        },
        confirmDialog: {
          title: t('confirm.delete_title'),
          description: t('confirm.delete_description'),
        },
      },
    ],
    
    // 过滤器
    filters: {
      configs: [
        {
          key: 'search',
          label: t('common.search'),
          type: 'search',
          placeholder: t('common.search_placeholder'),
        },
        {
          key: 'type',
          label: t('filters.type'),
          type: 'multi-select',
          options: assetTypes,
          searchable: true,
          clearable: true,
        },
      ],
      values: filterValues,
      onChange: setFilterValues,
    },
    
    // 列可见性
    columnVisibility: {
      enabled: true,
    },
    
    // 动画
    animations: {
      enabled: true,
      batchActionBar: true,
    },
    
    // 空状态
    emptyState: {
      icon: <Inbox className="h-6 w-6" />,
      title: t('table.empty_title'),
      description: t('table.empty_description'),
    },
  }
  
  return <EnhancedTable {...config} />
}
```

---

## 六、迁移策略

### 6.1 Watchlist 表格迁移步骤

1. **保留现有实现**：在新组件完成前不删除旧代码
2. **并行开发**：在 `components/table` 下开发新组件
3. **逐步迁移**：
   - 先迁移简单页面测试
   - 验证功能完整性
   - 迁移 watchlist 页面
   - 删除旧代码
4. **向后兼容**：确保 API 调用不变

### 6.2 迁移清单

- [ ] 创建列定义适配器（将现有 columns.tsx 转换为新格式）
- [ ] 提取批量操作逻辑
- [ ] 提取过滤器配置
- [ ] 更新页面组件使用新表格
- [ ] 测试所有功能
- [ ] 更新国际化 keys
- [ ] 删除旧组件

---

## 七、技术栈

### 7.1 核心依赖

- **@tanstack/react-table**: ^8.x（表格核心）
- **framer-motion**: ^11.x（动画效果）
- **react-i18next**: ^14.x（国际化，可选）
- **lucide-react**: ^0.x（图标）

### 7.2 UI 组件依赖

- 基于现有 `@/components/ui` 组件库
- Table, Button, Dropdown, Checkbox, Input, Badge 等

---

## 八、测试计划

### 8.1 单元测试

- [ ] `utils/pagination-helpers.ts` 测试
- [ ] `utils/table-helpers.ts` 测试
- [ ] `hooks/use-pagination.ts` 测试
- [ ] `hooks/use-row-selection.ts` 测试

### 8.2 集成测试

- [ ] 基础表格渲染
- [ ] 分页功能
- [ ] 行选择功能
- [ ] 批量操作功能
- [ ] 过滤器功能
- [ ] 列可见性功能

### 8.3 E2E 测试

- [ ] Watchlist 页面完整流程
- [ ] 其他使用新表格的页面

---

## 九、性能优化

### 9.1 优化点

1. **虚拟滚动**：大数据集支持（可选功能）
2. **记忆化**：使用 `useMemo` 和 `useCallback`
3. **懒加载**：按需加载子组件
4. **防抖节流**：搜索和过滤操作

### 9.2 性能指标

- 初始渲染时间 < 100ms
- 分页切换时间 < 50ms
- 批量操作响应时间 < 200ms

---

## 十、时间估算

| 阶段     | 任务                | 预计时间       |
| -------- | ------------------- | -------------- |
| 阶段一   | 基础架构            | 2-3 小时       |
| 阶段二   | 核心 Hooks          | 3-4 小时       |
| 阶段三   | UI 子组件           | 4-6 小时       |
| 阶段四   | 主组件              | 2-3 小时       |
| 阶段五   | 导出和文档          | 1-2 小时       |
| 测试     | 单元测试 + 集成测试 | 3-4 小时       |
| 迁移     | Watchlist 迁移      | 2-3 小时       |
| **总计** |                     | **17-25 小时** |

---

## 十一、风险和挑战

### 11.1 技术风险

1. **类型复杂度**：泛型类型可能导致类型推断困难
   - **缓解措施**：提供完整的类型示例和文档

2. **API 设计**：配置项过多可能导致使用复杂
   - **缓解措施**：提供合理的默认值和简化的 API

3. **性能问题**：过度抽象可能影响性能
   - **缓解措施**：性能测试和优化

### 11.2 业务风险

1. **迁移成本**：现有页面迁移需要时间
   - **缓解措施**：提供迁移工具和详细文档

2. **功能遗漏**：新组件可能缺少某些特定功能
   - **缓解措施**：充分分析现有功能，提供扩展点

---

## 十二、后续扩展

### 12.1 可选功能

- [ ] 虚拟滚动支持
- [ ] 拖拽排序
- [ ] 列宽调整
- [ ] 列固定（sticky columns）
- [ ] 行展开（expandable rows）
- [ ] 树形表格
- [ ] 导出功能（CSV, Excel）
- [ ] 列分组
- [ ] 行分组
- [ ] 内联编辑

### 12.2 集成计划

- [ ] 与表单系统集成
- [ ] 与权限系统集成
- [ ] 与主题系统深度集成
- [ ] 提供 Storybook 示例

---

## 十三、成功标准

### 13.1 功能完整性

- ✅ 所有 watchlist 表格功能都能实现
- ✅ 支持至少 3 个不同业务场景
- ✅ 通过所有测试用例

### 13.2 代码质量

- ✅ TypeScript 类型覆盖率 100%
- ✅ 单元测试覆盖率 > 80%
- ✅ 无 ESLint 错误
- ✅ 代码审查通过

### 13.3 用户体验

- ✅ 性能指标达标
- ✅ 动画流畅
- ✅ 响应式设计
- ✅ 无障碍性支持

### 13.4 开发体验

- ✅ API 简洁易用
- ✅ 文档完整清晰
- ✅ 示例代码丰富
- ✅ 类型提示友好

---

## 十四、总结

本计划详细分析了 watchlist 表格的实现，并设计了一个通用的增强版表格组件架构。通过合理的抽象和模块化设计，新组件将具备以下优势：

1. **高度可复用**：适用于各种业务场景
2. **类型安全**：完整的 TypeScript 支持
3. **功能丰富**：涵盖常见表格需求
4. **易于扩展**：清晰的扩展点设计
5. **性能优秀**：优化的渲染和状态管理
6. **开发友好**：简洁的 API 和完整的文档

建议按照阶段逐步实施，优先完成核心功能，然后逐步添加增强功能。
