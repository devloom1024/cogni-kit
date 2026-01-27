import { useState, useCallback } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table'
import type { SortingState, VisibilityState, RowSelectionState } from '@tanstack/react-table'
import type { EnhancedTableConfig } from '../types'

export interface UseTableStateResult<TData> {
    table: ReturnType<typeof useReactTable<TData>>
    sorting: SortingState
    columnVisibility: VisibilityState
    rowSelection: RowSelectionState
}

/**
 * 表格状态管理 Hook
 * @param config 表格配置
 * @returns TanStack Table 实例和状态
 */
export function useTableState<TData>(
    config: EnhancedTableConfig<TData>
): UseTableStateResult<TData> {
    // 排序状态
    const [internalSorting, setInternalSorting] = useState<SortingState>([])
    const sorting = config.sorting?.state ?? internalSorting

    // 处理排序变化
    const handleSortingChange = useCallback(
        (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
            const newSorting =
                typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue

            if (config.sorting?.onSortingChange) {
                config.sorting.onSortingChange(newSorting)
            } else {
                setInternalSorting(newSorting)
            }
        },
        [sorting, config.sorting?.onSortingChange]
    )

    // 列可见性状态
    const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
    const columnVisibility = config.columnVisibility?.state ?? internalColumnVisibility

    // 处理列可见性变化
    const handleColumnVisibilityChange = useCallback(
        (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
            const newVisibility =
                typeof updaterOrValue === 'function' ? updaterOrValue(columnVisibility) : updaterOrValue

            if (config.columnVisibility?.onVisibilityChange) {
                config.columnVisibility.onVisibilityChange(newVisibility)
            } else {
                setInternalColumnVisibility(newVisibility)
            }
        },
        [columnVisibility, config.columnVisibility?.onVisibilityChange]
    )

    // 行选择状态
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    // 判断是否使用服务端模式
    const isServerMode = config.sorting?.mode !== 'client' && config.pagination?.meta !== undefined

    // 创建 table 实例
    const table = useReactTable({
        data: config.data,
        columns: config.columns,
        getRowId: config.getRowId || ((row: any, index: number) => row.id || String(index)),
        getCoreRowModel: getCoreRowModel(),

        // 排序
        ...(config.sorting?.enabled && {
            onSortingChange: handleSortingChange,
            ...(isServerMode
                ? { manualSorting: true }
                : { getSortedRowModel: getSortedRowModel() }),
        }),

        // 分页
        ...(config.pagination?.meta && {
            manualPagination: true,
            pageCount: config.pagination.meta.totalPages ?? -1,
        }),

        // 如果是客户端模式且没有服务端分页，使用客户端分页
        ...(!isServerMode && !config.pagination?.meta && {
            getPaginationRowModel: getPaginationRowModel(),
        }),

        // 过滤（目前假设都是服务端过滤）
        ...(config.filters && {
            manualFiltering: true,
        }),

        // 列可见性
        ...(config.columnVisibility?.enabled && {
            onColumnVisibilityChange: handleColumnVisibilityChange,
        }),

        // 行选择
        ...(config.selection?.enabled && {
            onRowSelectionChange: setRowSelection,
            enableRowSelection: true,
            enableMultiRowSelection: config.selection.mode !== 'single',
        }),

        state: {
            ...(config.sorting?.enabled && { sorting }),
            ...(config.columnVisibility?.enabled && { columnVisibility }),
            ...(config.selection?.enabled && { rowSelection }),
        },
    })

    return {
        table,
        sorting,
        columnVisibility,
        rowSelection,
    }
}
