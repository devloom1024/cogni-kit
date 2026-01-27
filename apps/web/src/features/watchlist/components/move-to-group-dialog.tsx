import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { watchlistClient } from '../api/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { WatchlistGroup } from 'shared'

interface MoveToGroupDialogProps {
    itemId: string
    currentGroupId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    groups: WatchlistGroup[]
    onSuccess: () => void
}

export function MoveToGroupDialog({
    itemId,
    currentGroupId,
    open,
    onOpenChange,
    groups,
    onSuccess,
}: MoveToGroupDialogProps) {
    const { t } = useTranslation()
    const [newGroupName, setNewGroupName] = useState('')
    const [loading, setLoading] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!newGroupName.trim()) return
        setLoading('create')
        try {
            const newGroup = await watchlistClient.createGroup({ name: newGroupName.trim() })
            await handleMove(newGroup.id)
        } catch {
            toast.error(t('watchlist.actions.create_error'))
        } finally {
            setLoading(null)
        }
    }

    const handleMove = async (groupId: string) => {
        setLoading(groupId)
        try {
            await watchlistClient.moveItem(itemId, groupId)
            toast.success(t('watchlist.actions.move_success'))
            onOpenChange(false)
            onSuccess()
        } catch {
            toast.error(t('watchlist.actions.move_error'))
        } finally {
            setLoading(null)
        }
    }

    // Filter out current group from options
    const availableGroups = groups.filter(g => g.id !== currentGroupId)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('watchlist.actions.move_to_title')}</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-2">
                    <Input
                        placeholder={t('watchlist.groups.create_placeholder')}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button onClick={handleCreate} disabled={!newGroupName.trim() || loading !== null}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {availableGroups.length === 0 && (
                    <div className="text-sm text-muted-foreground mb-2">
                        {t('watchlist.search.empty')}
                    </div>
                )}

                <ScrollArea className="h-[240px] w-full rounded-md border p-2">
                    <div className="flex flex-col gap-1">
                        {availableGroups.map((group) => (
                            <Button
                                key={group.id}
                                variant="ghost"
                                className={cn(
                                    "justify-start h-10 px-2 font-normal",
                                    loading !== null && "opacity-50 pointer-events-none"
                                )}
                                onClick={() => handleMove(group.id)}
                            >
                                <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-left truncate">{group.name}</span>
                                <Badge variant="secondary" className="ml-auto text-xs font-normal">
                                    {group.itemCount}
                                </Badge>
                                {loading === group.id && (
                                    <span className="ml-2 animate-spin">⏳</span>
                                )}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
