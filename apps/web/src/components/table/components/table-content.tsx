import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import {
    Table as UITable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { TableEmpty } from './table-empty'
import type { EmptyStateConfig } from '../types'
import { Spinner } from '@/components/ui/spinner'

export interface TableContentProps<TData> {
    table: Table<TData>
    emptyState?: EmptyStateConfig
    className?: string
    loading?: boolean
}

/**
 * 表格内容组件
 * 渲染表格的头部和主体
 */
export function TableContent<TData>({
    table,
    emptyState,
    className,
    loading,
}: TableContentProps<TData>) {
    const rows = table.getRowModel().rows
    const hasData = rows && rows.length > 0
    const columns = table.getAllColumns()

    return (
        <div className="border rounded-md">
            <UITable className={className}>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                <div className="flex justify-center items-center">
                                    <Spinner className="size-6 text-muted-foreground" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : hasData ? (
                        rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableEmpty config={emptyState} columnCount={columns.length} />
                    )}
                </TableBody>
            </UITable>
        </div>
    )
}
