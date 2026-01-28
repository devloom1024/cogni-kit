import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Inbox, FolderOpen } from 'lucide-react'
import type { WatchlistItem } from 'shared'
import type { SortingState } from '@tanstack/react-table'
import { EnhancedTable } from '@/components/table'
import type { EnhancedTableConfig, PaginationMeta } from '@/components/table'
import { useWatchlistColumns } from './columns'
import { WatchlistFiltersBar, type WatchlistFilters } from './watchlist-filters'

interface WatchlistTableProps {
    data: WatchlistItem[]
    meta?: PaginationMeta
    onPageChange: (page: number) => void
    onMoveClick: (itemId: string) => void
    onRemove: (itemId: string, groupId: string) => void
    onBatchRemove?: (itemIds: string[]) => void
    onBatchMove?: (itemIds: string[]) => void
    currentGroupId: string
    loading?: boolean
    filters: WatchlistFilters
    onFiltersChange: (filters: WatchlistFilters) => void
    sorting?: SortingState
    onSortingChange?: (sorting: SortingState) => void
}

/**
 * Watchlist 表格组件
 * 基于通用 EnhancedTable 组件实现
 */
export function WatchlistTable({
    data,
    meta,
    onPageChange,
    onMoveClick,
    onRemove,
    onBatchRemove,
    onBatchMove,
    loading,
    filters,
    onFiltersChange,
    sorting,
    onSortingChange,
}: WatchlistTableProps) {
    const { t } = useTranslation()

    // 列定义
    const columns = useWatchlistColumns({ onRemove, onMoveClick })

    // 批量操作配置
    const batchActions = useMemo(() => {
        const actions = []

        if (onBatchMove) {
            actions.push({
                key: 'batch-move',
                label: t('watchlist.table.batch_move'),
                icon: <FolderOpen className="h-4 w-4" />,
                variant: 'default' as const, // Use default or secondary variant
                onClick: (selectedRows: WatchlistItem[]) => {
                    const itemIds = selectedRows.map((row) => row.id)
                    onBatchMove(itemIds)
                },
            })
        }

        if (onBatchRemove) {
            actions.push({
                key: 'batch-remove',
                label: t('watchlist.table.batch_remove'),
                icon: <Trash2 className="h-4 w-4" />,
                variant: 'destructive' as const,
                onClick: async (selectedRows: WatchlistItem[]) => {
                    const itemIds = selectedRows.map((row) => row.id)
                    await onBatchRemove(itemIds)
                },
                confirmDialog: {
                    title: t('watchlist.table.batch_remove_confirm_title'),
                    description: (count: number) => t('watchlist.table.batch_remove_confirm_description', {
                        count,
                    }),
                    confirmText: t('watchlist.table.batch_remove'),
                    cancelText: t('common.cancel'),
                },
            })
        }

        return actions
    }, [onBatchMove, onBatchRemove, t])

    // 表格配置
    const tableConfig: EnhancedTableConfig<WatchlistItem> = {
        columns,
        data,
        loading,
        className: "!space-y-4",

        // 分页配置
        pagination: {
            meta,
            onPageChange,
            showTotal: true,
            totalLabel: t('watchlist.table.total_count', { count: meta?.total || 0 }),
            previousLabel: t('common.previous'),
            nextLabel: t('common.next'),
        },

        // 行选择配置
        selection: {
            enabled: true,
            mode: 'multiple',
        },

        // 批量操作配置
        batchActions,

        // 排序配置
        sorting: {
            enabled: true,
            mode: 'server',
            state: sorting,
            onSortingChange,
        },

        // 列可见性配置
        columnVisibility: {
            enabled: true,
            getColumnLabel: (columnId) => {
                // 特殊列的标签
                if (columnId === 'select') return t('watchlist.table.select')
                if (columnId === 'actions') return t('watchlist.table.actions')
                // 其他列使用标准的 i18n key
                return t(`watchlist.table.${columnId}`)
            },
        },

        // 动画配置
        animations: {
            enabled: true,
            batchActionBar: true,
        },

        // 自定义工具栏内容
        toolbarContent: (
            <WatchlistFiltersBar
                filters={filters}
                onFiltersChange={onFiltersChange}
                className="mb-0"
            />
        ),

        // 空状态配置
        emptyState: {
            icon: <Inbox className="h-6 w-6" />,
            title: t('watchlist.table.empty'),
            description: t('watchlist.table.empty_description'),
        },
    }

    return (
        <div className="flex flex-col space-y-4">
            {/* 表格 */}
            <EnhancedTable {...tableConfig} />
        </div>
    )
}
