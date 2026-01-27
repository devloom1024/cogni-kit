import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import type { PaginationConfig } from '../types'
import { usePagination } from '../hooks/use-pagination'

export interface TablePaginationProps extends PaginationConfig {
    onPageChange: (page: number) => void
}

/**
 * 表格分页组件
 */
export function TablePagination({
    meta,
    onPageChange,
    showTotal = true,
    totalLabel = '共 {total} 条',
    previousLabel = '上一页',
    nextLabel = '下一页',
}: TablePaginationProps) {
    const { pageNumbers, canPrevious, canNext, paginationRange, isValid } = usePagination(meta)

    if (!isValid || !meta) {
        return null
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= meta.totalPages) {
            onPageChange(page)
        }
    }

    return (
        <div className="flex items-center justify-end gap-4">
            {showTotal && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {totalLabel.replace('{total}', String(meta.total))}
                    {paginationRange && (
                        <span className="ml-2">
                            ({paginationRange.from}-{paginationRange.to})
                        </span>
                    )}
                </div>
            )}
            <Pagination className="!mx-0 !justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={canPrevious ? () => handlePageChange(meta.page - 1) : undefined}
                            className={canPrevious ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:block">{previousLabel}</span>
                        </PaginationPrevious>
                    </PaginationItem>
                    {pageNumbers.map((page, index) => (
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
                            onClick={canNext ? () => handlePageChange(meta.page + 1) : undefined}
                            className={canNext ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                        >
                            <span className="hidden sm:block">{nextLabel}</span>
                            <ChevronRight className="h-4 w-4" />
                        </PaginationNext>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
