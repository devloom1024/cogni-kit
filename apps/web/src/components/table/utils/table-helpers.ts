import type { Table } from '@tanstack/react-table'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'

/**
 * 获取选中行的数据
 * @param table TanStack Table 实例
 * @returns 选中行的数据数组
 */
export function getSelectedRowsData<TData>(table: Table<TData>): TData[] {
    return table.getSelectedRowModel().rows.map(row => row.original)
}

/**
 * 获取选中行的 ID 数组
 * @param table TanStack Table 实例
 * @param getRowId 获取行 ID 的函数
 * @returns 选中行的 ID 数组
 */
export function getSelectedRowIds<TData>(
    table: Table<TData>,
    getRowId?: (row: TData) => string
): string[] {
    const selectedRows = table.getSelectedRowModel().rows

    if (getRowId) {
        return selectedRows.map(row => getRowId(row.original))
    }

    // 默认使用行的 id 字段
    return selectedRows.map(row => {
        const data = row.original as any
        return data.id || row.id
    })
}

/**
 * 获取可见的列
 * @param columns 所有列定义
 * @param visibility 列可见性状态
 * @returns 可见的列定义数组
 */
export function getVisibleColumns<TData>(
    columns: ColumnDef<TData>[],
    visibility: VisibilityState
): ColumnDef<TData>[] {
    return columns.filter((column) => {
        const columnId = 'id' in column ? column.id : 'accessorKey' in column ? String(column.accessorKey) : undefined
        if (!columnId) return true
        return visibility[columnId] !== false
    })
}

/**
 * 检查是否有选中的行
 * @param table TanStack Table 实例
 * @returns 是否有选中的行
 */
export function hasSelectedRows<TData>(table: Table<TData>): boolean {
    return table.getSelectedRowModel().rows.length > 0
}

/**
 * 获取选中行的数量
 * @param table TanStack Table 实例
 * @returns 选中行的数量
 */
export function getSelectedRowCount<TData>(table: Table<TData>): number {
    return table.getSelectedRowModel().rows.length
}

/**
 * 清除所有选中的行
 * @param table TanStack Table 实例
 */
export function clearRowSelection<TData>(table: Table<TData>): void {
    table.resetRowSelection()
}

/**
 * 切换所有行的选中状态
 * @param table TanStack Table 实例
 * @param selected 是否选中
 */
export function toggleAllRows<TData>(table: Table<TData>, selected: boolean): void {
    table.toggleAllPageRowsSelected(selected)
}
