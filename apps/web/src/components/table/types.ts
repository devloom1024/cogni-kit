import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

/**
 * 分页元数据
 */
export interface PaginationMeta {
    page: number
    limit: number
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
        description: string | ((selectedCount: number) => ReactNode)
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
 * 排序配置
 */
export interface SortingConfig {
    enabled: boolean
    mode?: 'client' | 'server' // 默认 'server'
    state?: SortingState
    onSortingChange?: (sorting: SortingState) => void
}

/**
 * 选择配置
 */
export interface SelectionConfig {
    enabled: boolean
    mode?: 'single' | 'multiple'
    onSelectionChange?: (selectedRowIds: string[]) => void
}

/**
 * 列可见性配置
 */
export interface ColumnVisibilityConfig {
    enabled: boolean
    state?: VisibilityState
    onVisibilityChange?: (visibility: VisibilityState) => void
    getColumnLabel?: (columnId: string) => string
}

/**
 * 分页配置
 */
export interface PaginationConfig {
    meta?: PaginationMeta
    onPageChange?: (page: number) => void
    showTotal?: boolean
    totalLabel?: string
    previousLabel?: string
    nextLabel?: string
}

/**
 * 过滤器配置
 */
export interface FiltersConfig {
    configs: FilterConfig[]
    values: Record<string, any>
    onChange: (filters: Record<string, any>) => void
}

/**
 * 动画配置
 */
export interface AnimationsConfig {
    enabled: boolean
    batchActionBar?: boolean
}

/**
 * 增强表格配置
 */
export interface EnhancedTableConfig<TData> {
    // 核心配置
    columns: ColumnDef<TData>[]
    data: TData[]

    // 分页配置
    pagination?: PaginationConfig

    // 选择配置
    selection?: SelectionConfig

    // 批量操作配置
    batchActions?: BatchAction<TData>[]

    // 过滤器配置
    filters?: FiltersConfig

    // 排序配置
    sorting?: SortingConfig

    // 列可见性配置
    columnVisibility?: ColumnVisibilityConfig

    // 自定义工具栏内容
    toolbarContent?: ReactNode

    // 行 ID 获取函数
    getRowId?: (originalRow: TData, index: number, parent?: any) => string

    // 状态配置
    loading?: boolean
    emptyState?: EmptyStateConfig

    // 动画配置
    animations?: AnimationsConfig

    // 样式配置
    className?: string
    tableClassName?: string
}
