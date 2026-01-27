import type { PaginationMeta } from '../types'

/**
 * 计算分页页码数组
 * @param currentPage 当前页码
 * @param totalPages 总页数
 * @param maxVisible 最多显示的页码数量
 * @returns 页码数组，包含数字和省略号
 */
export function calculatePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 7
): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= maxVisible) {
        // 总页数小于等于最大显示数，显示所有页码
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
    } else {
        // 总页数大于最大显示数，需要省略
        if (currentPage <= 3) {
            // 当前页在前面
            pages.push(1, 2, 3, 4, 'ellipsis', totalPages)
        } else if (currentPage >= totalPages - 2) {
            // 当前页在后面
            pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
            // 当前页在中间
            pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
        }
    }

    return pages
}

/**
 * 计算分页范围
 * @param page 当前页码
 * @param limit 每页数量
 * @param total 总数
 * @returns 当前页的数据范围
 */
export function getPaginationRange(
    page: number,
    limit: number,
    total: number
): { from: number; to: number } {
    const from = (page - 1) * limit + 1
    const to = Math.min(page * limit, total)

    return { from, to }
}

/**
 * 验证分页元数据
 * @param meta 分页元数据
 * @returns 是否有效
 */
export function isValidPaginationMeta(meta?: PaginationMeta): meta is PaginationMeta {
    if (!meta) return false

    return (
        typeof meta.page === 'number' &&
        typeof meta.limit === 'number' &&
        typeof meta.total === 'number' &&
        typeof meta.totalPages === 'number' &&
        meta.page > 0 &&
        meta.limit > 0 &&
        meta.total >= 0 &&
        meta.totalPages >= 0
    )
}

/**
 * 计算总页数
 * @param total 总数
 * @param limit 每页数量
 * @returns 总页数
 */
export function calculateTotalPages(total: number, limit: number): number {
    if (limit <= 0) return 0
    return Math.ceil(total / limit)
}
