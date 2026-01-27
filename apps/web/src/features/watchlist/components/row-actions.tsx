import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Trash2, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Row } from '@tanstack/react-table'
import type { WatchlistItem } from 'shared'
import { watchlistClient } from '../api/client'
import { toast } from 'sonner'

interface WatchlistRowActionsProps {
    row: Row<WatchlistItem>
    onRemove: (itemId: string, groupId: string) => void
    onMoveClick: (itemId: string) => void
}

export function WatchlistRowActions({ row, onRemove, onMoveClick }: WatchlistRowActionsProps) {
    const { t } = useTranslation()
    const item = row.original
    const [removing, setRemoving] = useState(false)

    const handleRemove = async () => {
        if (!confirm(t('watchlist.actions.remove_confirm'))) return
        setRemoving(true)
        try {
            await watchlistClient.removeItem(item.id)
            toast.success(t('watchlist.actions.remove_success'))
            onRemove(item.id, item.groupId)
        } catch {
            toast.error(t('watchlist.actions.remove_error'))
        } finally {
            setRemoving(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    disabled={removing}
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => onMoveClick(item.id)}>
                    <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                    {t('watchlist.actions.move_to')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleRemove}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    {t('watchlist.actions.remove')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
