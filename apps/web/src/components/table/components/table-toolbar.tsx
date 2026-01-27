import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TableToolbarProps {
    children?: ReactNode
    className?: string
}

/**
 * 表格工具栏组件
 * 用于放置过滤器、搜索框、列可见性菜单等工具
 */
export function TableToolbar({ children, className }: TableToolbarProps) {
    if (!children) return null

    return (
        <div className={cn('flex items-center gap-4 mb-4', className)}>
            {children}
        </div>
    )
}
