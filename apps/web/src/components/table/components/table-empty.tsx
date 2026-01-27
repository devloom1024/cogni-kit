import { Inbox } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Empty, EmptyMedia } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import type { EmptyStateConfig } from '../types'

export interface TableEmptyProps {
    config?: EmptyStateConfig
    columnCount: number
}

/**
 * 表格空状态组件
 * 当表格没有数据时显示
 */
export function TableEmpty({ config, columnCount }: TableEmptyProps) {
    const defaultIcon = <Inbox className="h-6 w-6 text-muted-foreground" />
    const defaultTitle = '暂无数据'
    const defaultDescription = '当前没有可显示的数据'

    return (
        <TableRow>
            <TableCell colSpan={columnCount} className="h-96 text-center">
                <div className="flex justify-center items-center h-full">
                    <Empty>
                        <EmptyMedia variant="icon" className="mb-4">
                            {config?.icon ?? defaultIcon}
                        </EmptyMedia>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {config?.title ?? defaultTitle}
                            </p>
                            {(config?.description || !config?.title) && (
                                <p className="text-sm text-muted-foreground">
                                    {config?.description ?? defaultDescription}
                                </p>
                            )}
                            {config?.action && (
                                <div className="pt-2">
                                    <Button onClick={config.action.onClick} variant="outline">
                                        {config.action.label}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Empty>
                </div>
            </TableCell>
        </TableRow>
    )
}
