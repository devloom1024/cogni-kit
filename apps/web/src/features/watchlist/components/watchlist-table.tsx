import { useState } from 'react'
import { Inbox } from 'lucide-react'
import {
    Empty,
    EmptyMedia,
} from '@/components/ui/empty'
import {
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import type { PaginationMeta, WatchlistItem } from 'shared'
import { useWatchlistColumns } from './columns'

interface WatchlistTableProps {
    data: WatchlistItem[]
    meta?: PaginationMeta
    onPageChange: (page: number) => void
    onMoveClick: (itemId: string) => void
    onRemove: (itemId: string, groupId: string) => void
    currentGroupId: string
}

export function WatchlistTable({
    data,
    meta,
    onPageChange,
    onMoveClick,
    onRemove,
}: WatchlistTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const columns = useWatchlistColumns({ onRemove, onMoveClick })

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        pageCount: meta?.totalPages ?? -1,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (meta?.totalPages ?? 1)) {
            onPageChange(newPage)
        }
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        if (!meta) return []
        const totalPages = meta.totalPages
        const currentPage = meta.page
        const pages: (number | 'ellipsis')[] = []

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, 'ellipsis', totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
            }
        }

        return pages
    }

    return (
        <div className="flex flex-col space-y-4">
            {/* 表格区域 */}
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-96 text-center"
                                >
                                    <div className="flex justify-center items-center h-full">
                                        <Empty>
                                            <EmptyMedia variant="icon" className="mb-4">
                                                <Inbox className="h-6 w-6 text-muted-foreground" />
                                            </EmptyMedia>
                                        </Empty>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 分页控件 */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-end gap-4 py-4">
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        共 {meta.total} 条
                    </div>
                    <Pagination className="!mx-0 !justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={meta.page <= 1 ? undefined : () => handlePageChange(meta.page - 1)}
                                    className={meta.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {getPageNumbers().map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === 'ellipsis' ? (
                                        <span className="px-2">...</span>
                                    ) : (
                                        <PaginationLink
                                            onClick={() => handlePageChange(page)}
                                            isActive={page === meta.page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={meta.page >= meta.totalPages ? undefined : () => handlePageChange(meta.page + 1)}
                                    className={meta.page >= meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
