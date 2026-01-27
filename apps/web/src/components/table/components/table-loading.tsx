import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export interface TableLoadingProps {
    loading?: boolean
    children: ReactNode
}

/**
 * 表格加载状态组件
 * 在表格上方显示一个半透明的加载遮罩
 */
export function TableLoading({ loading, children }: TableLoadingProps) {
    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            {children}
        </div>
    )
}
