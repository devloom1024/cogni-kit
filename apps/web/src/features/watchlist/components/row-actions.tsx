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
import { useRemoveWatchlistItem } from '../queries'
import { MoveToGroupDialog } from './move-to-group-dialog'

interface WatchlistRowActionsProps {
    row: Row<WatchlistItem>
}

export function WatchlistRowActions({ row }: WatchlistRowActionsProps) {
    const { t } = useTranslation()
    const item = row.original
    const removeMutation = useRemoveWatchlistItem()

    const handleRemove = () => {
        // Optimistic UI handled by mutation or refetch
        if (confirm(t('watchlist.actions.remove_confirm'))) {
            removeMutation.mutate({ itemId: item.id, groupId: item.groupId })
        }
    }

    const [showMoveDialog, setShowMoveDialog] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
                        <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                        {t('watchlist.actions.move_to')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRemove} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        {t('watchlist.actions.remove')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <MoveToGroupDialog
                itemId={item.id}
                currentGroupId={item.groupId}
                open={showMoveDialog}
                onOpenChange={setShowMoveDialog}
            />
        </>
    )
}
