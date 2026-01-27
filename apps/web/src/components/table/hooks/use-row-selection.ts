import { useMemo, useCallback } from 'react'
import type { Table } from '@tanstack/react-table'
import type { SelectionConfig } from '../types'
import {
    getSelectedRowsData,
    getSelectedRowIds,
    hasSelectedRows,
    getSelectedRowCount,
    clearRowSelection,
    toggleAllRows,
} from '../utils/table-helpers'

export interface UseRowSelectionResult<TData> {
    selectedRows: TData[]
    selectedRowIds: string[]
    selectedCount: number
    hasSelection: boolean
    clearSelection: () => void
    selectAll: () => void
    deselectAll: () => void
}

/**
 * 行选择逻辑 Hook
 * @param table TanStack Table 实例
 * @param config 选择配置
 * @returns 行选择相关状态和方法
 */
export function useRowSelection<TData>(
    table: Table<TData>,
    config?: SelectionConfig
): UseRowSelectionResult<TData> {
    // 获取选中的行数据
    const selectedRows = useMemo(() => {
        if (!config?.enabled) return []
        return getSelectedRowsData(table)
    }, [table.getState().rowSelection, config?.enabled])

    // 获取选中的行 ID
    const selectedRowIds = useMemo(() => {
        if (!config?.enabled) return []
        return getSelectedRowIds(table)
    }, [table.getState().rowSelection, config?.enabled])

    // 获取选中的行数量
    const selectedCount = useMemo(() => {
        if (!config?.enabled) return 0
        return getSelectedRowCount(table)
    }, [table.getState().rowSelection, config?.enabled])

    // 是否有选中的行
    const hasSelection = useMemo(() => {
        if (!config?.enabled) return false
        return hasSelectedRows(table)
    }, [table.getState().rowSelection, config?.enabled])

    // 清除选择
    const clearSelection = useCallback(() => {
        clearRowSelection(table)
    }, [table])

    // 全选
    const selectAll = useCallback(() => {
        toggleAllRows(table, true)
    }, [table])

    // 取消全选
    const deselectAll = useCallback(() => {
        toggleAllRows(table, false)
    }, [table])

    return {
        selectedRows,
        selectedRowIds,
        selectedCount,
        hasSelection,
        clearSelection,
        selectAll,
        deselectAll,
    }
}
