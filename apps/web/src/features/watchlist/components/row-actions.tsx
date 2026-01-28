import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreVertical, Trash2, ArrowRightLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
    const [alertOpen, setAlertOpen] = useState(false)

    const handleConfirmRemove = async () => {
        setRemoving(true)
        try {
            await watchlistClient.removeItem(item.id)
            toast.success(t('watchlist.actions.remove_success'))
            onRemove(item.id, item.groupId)
            setAlertOpen(false)
        } catch {
            toast.error(t('watchlist.actions.remove_error'))
        } finally {
            setRemoving(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        disabled={removing}
                    >
                        {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => onMoveClick(item.id)}>
                        <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                        {t('watchlist.actions.move_to')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault() // Prevent dropdown from closing immediately which feels abrupt? Actually allow close is fine for dialog trigger
                            setAlertOpen(true)
                        }}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        {t('watchlist.actions.remove')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('watchlist.actions.remove_confirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('watchlist.actions.remove_confirm_single', { name: `${item.asset.name} (${item.asset.symbol})` })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removing}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleConfirmRemove()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={removing}
                        >
                            {removing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('watchlist.actions.remove')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
