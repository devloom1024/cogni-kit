import { useMemo } from 'react'
import type { PaginationMeta } from '../types'
import { calculatePageNumbers, getPaginationRange, isValidPaginationMeta } from '../utils/pagination-helpers'

export interface UsePaginationResult {
    pageNumbers: (number | 'ellipsis')[]
    canPrevious: boolean
    canNext: boolean
    paginationRange: { from: number; to: number } | null
    isValid: boolean
}

/**
 * 分页逻辑 Hook
 * @param meta 分页元数据
 * @param maxVisiblePages 最多显示的页码数量
 * @returns 分页相关状态和方法
 */
export function usePagination(
    meta?: PaginationMeta,
    maxVisiblePages: number = 7
): UsePaginationResult {
    const isValid = isValidPaginationMeta(meta)

    const pageNumbers = useMemo(() => {
        if (!isValid || !meta) return []
        return calculatePageNumbers(meta.page, meta.totalPages, maxVisiblePages)
    }, [meta?.page, meta?.totalPages, maxVisiblePages, isValid])

    const canPrevious = useMemo(() => {
        if (!isValid || !meta) return false
        return meta.page > 1
    }, [meta?.page, isValid])

    const canNext = useMemo(() => {
        if (!isValid || !meta) return false
        return meta.page < meta.totalPages
    }, [meta?.page, meta?.totalPages, isValid])

    const paginationRange = useMemo(() => {
        if (!isValid || !meta) return null
        return getPaginationRange(meta.page, meta.pageSize, meta.total)
    }, [meta?.page, meta?.pageSize, meta?.total, isValid])

    return {
        pageNumbers,
        canPrevious,
        canNext,
        paginationRange,
        isValid,
    }
}
