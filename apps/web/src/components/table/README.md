# Enhanced Table Component

通用增强版表格组件，基于 TanStack Table v8 构建，提供丰富的功能和灵活的配置。

## 特性

- ✅ **服务端/客户端分页** - 支持两种分页模式
- ✅ **服务端/客户端排序** - 灵活的排序配置
- ✅ **行选择** - 单选或多选模式
- ✅ **批量操作** - 支持多个批量操作按钮和确认对话框
- ✅ **列可见性控制** - 用户可自定义显示的列
- ✅ **加载状态** - 优雅的加载遮罩
- ✅ **空状态** - 可自定义的空状态展示
- ✅ **动画效果** - 基于 Framer Motion 的流畅动画
- ✅ **TypeScript** - 完整的类型支持
- ✅ **零业务耦合** - 纯 UI 组件，不依赖任何业务逻辑

## 快速开始

### 基础用法

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

### 完整功能示例

```typescript
import { EnhancedTable } from '@/components/table'
import type { EnhancedTableConfig } from '@/components/table'
import { Trash2 } from 'lucide-react'

function AdvancedTable() {
  const [data, setData] = useState<Item[]>([])
  const [meta, setMeta] = useState<PaginationMeta>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [loading, setLoading] = useState(false)

  const config: EnhancedTableConfig<Item> = {
    columns: columns,
    data: data,
    loading: loading,
    
    // 分页
    pagination: {
      meta: meta,
      onPageChange: handlePageChange,
      showTotal: true,
      totalLabel: '共 {total} 条',
    },
    
    // 行选择
    selection: {
      enabled: true,
      mode: 'multiple',
    },
    
    // 批量操作
    batchActions: [
      {
        key: 'delete',
        label: '批量删除',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive',
        onClick: async (rows) => {
          await batchDelete(rows.map(r => r.id))
        },
        confirmDialog: {
          title: '确认删除',
          description: '确定要删除选中的项目吗？',
          confirmText: '删除',
          cancelText: '取消',
        },
      },
    ],
    
    // 排序（服务端）
    sorting: {
      enabled: true,
      mode: 'server',
      state: sorting,
      onSortingChange: setSorting,
    },
    
    // 列可见性
    columnVisibility: {
      enabled: true,
      getColumnLabel: (id) => t(`table.${id}`),
    },
    
    // 动画
    animations: {
      enabled: true,
      batchActionBar: true,
    },
    
    // 空状态
    emptyState: {
      icon: <Inbox className="h-6 w-6" />,
      title: '暂无数据',
      description: '当前没有可显示的数据',
    },
  }
  
  return <EnhancedTable {...config} />
}
```

## API 文档

### EnhancedTableConfig

主配置接口，所有配置项都是可选的。

#### 核心配置

| 属性             | 类型                 | 必填 | 说明                          |
| ---------------- | -------------------- | ---- | ----------------------------- |
| `columns`        | `ColumnDef<TData>[]` | ✅    | 列定义（TanStack Table 格式） |
| `data`           | `TData[]`            | ✅    | 表格数据                      |
| `loading`        | `boolean`            | ❌    | 加载状态                      |
| `className`      | `string`             | ❌    | 容器样式类名                  |
| `tableClassName` | `string`             | ❌    | 表格样式类名                  |

#### 分页配置 (pagination)

| 属性            | 类型                     | 说明         |
| --------------- | ------------------------ | ------------ |
| `meta`          | `PaginationMeta`         | 分页元数据   |
| `onPageChange`  | `(page: number) => void` | 页码变化回调 |
| `showTotal`     | `boolean`                | 是否显示总数 |
| `totalLabel`    | `string`                 | 总数标签模板 |
| `previousLabel` | `string`                 | 上一页标签   |
| `nextLabel`     | `string`                 | 下一页标签   |

#### 选择配置 (selection)

| 属性                | 类型                      | 说明           |
| ------------------- | ------------------------- | -------------- |
| `enabled`           | `boolean`                 | 是否启用行选择 |
| `mode`              | `'single' \| 'multiple'`  | 选择模式       |
| `onSelectionChange` | `(ids: string[]) => void` | 选择变化回调   |

#### 批量操作配置 (batchActions)

数组类型，每个操作包含：

| 属性            | 类型                                                 | 说明           |
| --------------- | ---------------------------------------------------- | -------------- |
| `key`           | `string`                                             | 唯一标识       |
| `label`         | `string`                                             | 按钮文本       |
| `icon`          | `ReactNode`                                          | 按钮图标       |
| `variant`       | `'default' \| 'destructive' \| 'outline' \| 'ghost'` | 按钮样式       |
| `onClick`       | `(rows: TData[]) => void \| Promise<void>`           | 点击回调       |
| `confirmDialog` | `object`                                             | 确认对话框配置 |

#### 排序配置 (sorting)

| 属性              | 类型                              | 说明                      |
| ----------------- | --------------------------------- | ------------------------- |
| `enabled`         | `boolean`                         | 是否启用排序              |
| `mode`            | `'client' \| 'server'`            | 排序模式（默认 'server'） |
| `state`           | `SortingState`                    | 排序状态                  |
| `onSortingChange` | `(sorting: SortingState) => void` | 排序变化回调              |

#### 列可见性配置 (columnVisibility)

| 属性                 | 类型                                    | 说明                 |
| -------------------- | --------------------------------------- | -------------------- |
| `enabled`            | `boolean`                               | 是否启用列可见性控制 |
| `state`              | `VisibilityState`                       | 可见性状态           |
| `onVisibilityChange` | `(visibility: VisibilityState) => void` | 可见性变化回调       |
| `getColumnLabel`     | `(columnId: string) => string`          | 获取列标签的函数     |

#### 空状态配置 (emptyState)

| 属性          | 类型                                     | 说明     |
| ------------- | ---------------------------------------- | -------- |
| `icon`        | `ReactNode`                              | 图标     |
| `title`       | `string`                                 | 标题     |
| `description` | `string`                                 | 描述     |
| `action`      | `{ label: string, onClick: () => void }` | 操作按钮 |

#### 动画配置 (animations)

| 属性             | 类型      | 说明           |
| ---------------- | --------- | -------------- |
| `enabled`        | `boolean` | 是否启用动画   |
| `batchActionBar` | `boolean` | 批量操作栏动画 |

## 服务端 vs 客户端模式

### 服务端模式（推荐）

适用于数据量大、需要服务端分页的场景。

```typescript
// 1. 添加排序状态
const [sorting, setSorting] = useState<SortingState>([])

// 2. 监听排序变化，重新获取数据
useEffect(() => {
  fetchData({
    page,
    pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  })
}, [sorting, page])

// 3. 配置表格
<EnhancedTable
  sorting={{
    enabled: true,
    mode: 'server', // 服务端排序
    state: sorting,
    onSortingChange: setSorting,
  }}
  pagination={{
    meta: paginationMeta, // 服务端返回的分页信息
    onPageChange: setPage,
  }}
/>
```

### 客户端模式

适用于数据量小、所有数据都在客户端的场景。

```typescript
<EnhancedTable
  data={allData} // 所有数据
  sorting={{
    enabled: true,
    mode: 'client', // 客户端排序
  }}
  // 不需要 pagination 配置，会自动使用客户端分页
/>
```

## 高级用法

### 自定义列定义

```typescript
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

const columns: ColumnDef<Item>[] = [
  // 选择列
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // 普通列
  {
    accessorKey: 'name',
    header: '名称',
  },
  // 自定义渲染
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  // 可排序列
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <div
        className="flex items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        创建时间
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
  },
]
```

### 单独使用子组件

所有子组件都可以单独使用：

```typescript
import { TablePagination, BatchActionBar } from '@/components/table'

// 单独使用分页组件
<TablePagination
  meta={meta}
  onPageChange={handlePageChange}
  showTotal
/>

// 单独使用批量操作栏
<BatchActionBar
  selectedCount={selectedRows.length}
  actions={batchActions}
  selectedRows={selectedRows}
  onClearSelection={clearSelection}
/>
```

## 注意事项

1. **服务端分页必须使用手动模式**：设置 `sorting.mode: 'server'` 和提供 `pagination.meta`
2. **选择列需要手动添加**：在 columns 中添加 select 列定义
3. **行 ID**：确保数据有 `id` 字段，或使用 TanStack Table 的 `getRowId` 配置
4. **国际化**：所有文本标签都可以通过 props 自定义

## 示例项目

查看 `apps/web/src/features/watchlist` 了解完整的使用示例。

## License

MIT
