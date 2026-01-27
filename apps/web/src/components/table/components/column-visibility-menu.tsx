import { Settings2 } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ColumnVisibilityMenuProps<TData> {
    table: Table<TData>
    label?: string
    menuLabel?: string
    getColumnLabel?: (columnId: string) => string
}

/**
 * 列可见性菜单组件
 * 允许用户控制哪些列显示或隐藏
 */
export function ColumnVisibilityMenu<TData>({
    table,
    label = '列',
    menuLabel = '切换列显示',
    getColumnLabel,
}: ColumnVisibilityMenuProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                    <Settings2 className="mr-2 h-4 w-4" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                        const columnLabel = getColumnLabel
                            ? getColumnLabel(column.id)
                            : column.columnDef.header && typeof column.columnDef.header === 'string'
                                ? column.columnDef.header
                                : column.id

                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {columnLabel}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
