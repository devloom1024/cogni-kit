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

export interface TableContentProps<TData> {
    table: Table<TData>
    emptyState?: EmptyStateConfig
    className?: string
}

/**
 * 表格内容组件
 * 渲染表格的头部和主体
 */
export function TableContent<TData>({
    table,
    emptyState,
    className,
}: TableContentProps<TData>) {
    const rows = table.getRowModel().rows
    const hasData = rows && rows.length > 0

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
                    {hasData ? (
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
                        <TableEmpty config={emptyState} columnCount={table.getAllColumns().length} />
                    )}
                </TableBody>
            </UITable>
        </div>
    )
}
