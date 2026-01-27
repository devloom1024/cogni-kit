import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { WatchlistItem } from 'shared'
import { WatchlistRowActions } from './row-actions'

interface UseWatchlistColumnsProps {
    onRemove: (itemId: string, groupId: string) => void
    onMoveClick: (itemId: string) => void
}

export const useWatchlistColumns = ({
    onRemove,
    onMoveClick,
}: UseWatchlistColumnsProps): ColumnDef<WatchlistItem>[] => {
    const { t } = useTranslation()

    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'asset',
            header: t('watchlist.table.asset'),
            cell: ({ row }) => {
                const asset = row.original.asset
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'type',
            header: t('watchlist.table.type'),
            cell: ({ row }) => {
                const type = row.original.asset.type
                return (
                    <Badge variant="outline">
                        {t(`watchlist.types.${type}`)}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'market',
            header: t('watchlist.table.market'),
            cell: ({ row }) => {
                const asset = row.original.asset
                return (
                    <div className="flex items-center">
                        {asset.market}
                        {asset.exchange && <span className="text-xs ml-1 text-muted-foreground">({asset.exchange})</span>}
                    </div>
                )
            }
        },
        {
            accessorKey: 'addedAt',
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center cursor-pointer hover:text-foreground/80 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('watchlist.table.added_at')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.original.addedAt)
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).replace(/\//g, '-')
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <WatchlistRowActions
                    row={row}
                    onRemove={onRemove}
                    onMoveClick={onMoveClick}
                />
            )
        },
    ]
}
