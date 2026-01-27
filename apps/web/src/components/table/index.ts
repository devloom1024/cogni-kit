// 主组件
export { EnhancedTable } from './components/enhanced-table'

// 子组件（可选单独使用）
export { BatchActionBar } from './components/batch-action-bar'
export { TableToolbar } from './components/table-toolbar'
export { TablePagination } from './components/table-pagination'
export { ColumnVisibilityMenu } from './components/column-visibility-menu'
export { TableLoading } from './components/table-loading'
export { TableEmpty } from './components/table-empty'
export { TableContent } from './components/table-content'

// Hooks
export { useTableState } from './hooks/use-table-state'
export { usePagination } from './hooks/use-pagination'
export { useRowSelection } from './hooks/use-row-selection'

// 类型
export type {
    PaginationMeta,
    BatchAction,
    FilterConfig,
    EmptyStateConfig,
    SortingConfig,
    SelectionConfig,
    ColumnVisibilityConfig,
    PaginationConfig,
    FiltersConfig,
    AnimationsConfig,
    EnhancedTableConfig,
} from './types'

// 工具函数
export {
    calculatePageNumbers,
    getPaginationRange,
    isValidPaginationMeta,
    calculateTotalPages,
} from './utils/pagination-helpers'

export {
    getSelectedRowsData,
    getSelectedRowIds,
    getVisibleColumns,
    hasSelectedRows,
    getSelectedRowCount,
    clearRowSelection,
    toggleAllRows,
} from './utils/table-helpers'
