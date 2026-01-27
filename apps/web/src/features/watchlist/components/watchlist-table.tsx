import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Settings2, Loader2, ChevronLeft, ChevronRight, CheckSquare, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Empty,
    EmptyMedia,
} from '@/components/ui/empty'

import {
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
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
import { WatchlistFiltersBar, type WatchlistFilters } from './watchlist-filters'

interface WatchlistTableProps {
    data: WatchlistItem[]
    meta?: PaginationMeta
    onPageChange: (page: number) => void
    onMoveClick: (itemId: string) => void
    onRemove: (itemId: string, groupId: string) => void
    onBatchRemove?: (itemIds: string[]) => void
    currentGroupId: string
    loading?: boolean
    filters: WatchlistFilters
    onFiltersChange: (filters: WatchlistFilters) => void
    sorting?: SortingState
    onSortingChange?: (sorting: SortingState) => void
}

export function WatchlistTable({
    data,
    meta,
    onPageChange,
    onMoveClick,
    onRemove,
    onBatchRemove,
    loading,
    filters,
    onFiltersChange,
    sorting: externalSorting,
    onSortingChange,
}: WatchlistTableProps) {
    const { t } = useTranslation()
    // 使用受控或非受控的排序状态
    const [internalSorting, setInternalSorting] = useState<SortingState>([])
    const sorting = externalSorting ?? internalSorting

    // 处理排序变化，支持 Updater 函数
    const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
        const newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)
            : updaterOrValue

        if (onSortingChange) {
            onSortingChange(newSorting)
        } else {
            setInternalSorting(newSorting)
        }
    }

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const columns = useWatchlistColumns({ onRemove, onMoveClick })

    const table = useReactTable({
        data,
        columns,
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
        // 服务端分页，不需要客户端的分页、排序、过滤 row models
        // getPaginationRowModel: getPaginationRowModel(),
        // getSortedRowModel: getSortedRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        manualPagination: true, // 启用手动分页模式
        manualSorting: true, // 启用手动排序模式
        manualFiltering: true, // 启用手动过滤模式
        pageCount: meta?.totalPages ?? -1,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
        },
    })

    // 获取选中的行
    const selectedRows = table.getSelectedRowModel().rows
    const hasSelection = selectedRows.length > 0

    // 批量操作处理函数
    const handleBatchRemoveClick = () => {
        setShowConfirmDialog(true)
    }

    const handleConfirmBatchRemove = () => {
        const itemIds = selectedRows.map(row => row.original.id)
        onBatchRemove?.(itemIds)
        setShowConfirmDialog(false)
        table.resetRowSelection()
    }

    const handleClearSelection = () => {
        table.resetRowSelection()
    }

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
            {/* 工具栏区域 */}
            <div className="relative min-h-12">
                {/* 默认过滤栏 */}
                <AnimatePresence mode="wait">
                    {!hasSelection && (
                        <motion.div
                            key="filters"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 flex items-center gap-4"
                        >
                            <WatchlistFiltersBar
                                filters={filters}
                                onFiltersChange={onFiltersChange}
                                className="mb-0 flex-1"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="shrink-0">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        {t('watchlist.table.columns')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t('watchlist.table.toggle_columns')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllColumns()
                                        .filter(
                                            (column) => column.getCanHide()
                                        )
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.columnDef.header && typeof column.columnDef.header === 'string'
                                                        ? column.columnDef.header
                                                        : t(`watchlist.table.${column.id === 'select' || column.id === 'actions' ? column.id : column.id}`)}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 批量操作栏 */}
                <AnimatePresence mode="wait">
                    {hasSelection && (
                        <motion.div
                            key="batch-actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 flex items-center justify-between gap-4 bg-muted/50 px-4 py-2.5 rounded-md border border-border"
                        >
                            {/* 左侧：选中信息 */}
                            <motion.div
                                className="flex items-center gap-2 text-sm font-medium"
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <CheckSquare className="h-4 w-4 text-primary" />
                                <span>
                                    {t('watchlist.table.selected_count', {
                                        count: selectedRows.length
                                    })}
                                </span>
                            </motion.div>

                            {/* 右侧：操作按钮 */}
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                {/* 取消选择 */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearSelection}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {t('watchlist.table.clear_selection')}
                                    </Button>
                                </motion.div>

                                {/* 批量移除 */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBatchRemoveClick}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('watchlist.table.batch_remove')}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 表格区域 */}
            <div className="border rounded-md relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}
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
                                            <span className="text-sm text-muted-foreground">{t('watchlist.table.empty')}</span>
                                        </Empty>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 分页控件 */}
            {meta && meta.total > 0 && (
                <div className="flex items-center justify-end gap-4">
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {t('watchlist.table.total_count', { count: meta.total })}
                    </div>
                    <Pagination className="!mx-0 !justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={meta.page <= 1 ? undefined : () => handlePageChange(meta.page - 1)}
                                    className={meta.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:block">{t('common.previous')}</span>
                                </PaginationPrevious>
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
                                >
                                    <span className="hidden sm:block">{t('common.next')}</span>
                                    <ChevronRight className="h-4 w-4" />
                                </PaginationNext>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* 批量删除确认对话框 */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('watchlist.table.batch_remove_confirm_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('watchlist.table.batch_remove_confirm_description', {
                                count: selectedRows.length
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmBatchRemove}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('watchlist.table.batch_remove')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
