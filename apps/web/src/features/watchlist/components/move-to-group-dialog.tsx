import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Check, FolderOpen } from 'lucide-react'
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
import {
    useWatchlistGroups,
    useCreateWatchlistGroup,
    useMoveWatchlistItem,
} from '../queries'
import { cn } from '@/lib/utils'

interface MoveToGroupDialogProps {
    itemId: string
    currentGroupId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MoveToGroupDialog({ itemId, currentGroupId, open, onOpenChange }: MoveToGroupDialogProps) {
    const { t } = useTranslation()
    const { data: groups } = useWatchlistGroups()
    const createMutation = useCreateWatchlistGroup()
    const moveMutation = useMoveWatchlistItem()

    const [newGroupName, setNewGroupName] = useState('')

    const handleCreate = () => {
        if (!newGroupName.trim()) return
        createMutation.mutate(
            { name: newGroupName.trim() },
            {
                onSuccess: (newGroup) => {
                    // Auto move to new group or just clear input?
                    // User probably wants to move to this new group immediately.
                    moveMutation.mutate(
                        { itemId, targetGroupId: newGroup.id },
                        {
                            onSuccess: () => {
                                setNewGroupName('')
                                onOpenChange(false)
                            }
                        }
                    )
                }
            }
        )
    }

    const handleMove = (groupId: string) => {
        if (groupId === currentGroupId) return // Should not happen if filtered, but safe check

        moveMutation.mutate(
            { itemId, targetGroupId: groupId },
            {
                onSuccess: () => {
                    onOpenChange(false)
                }
            }
        )
    }

    // Filter out current group from options
    const availableGroups = groups?.filter(g => g.id !== currentGroupId) || []

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
                    <Button onClick={handleCreate} disabled={!newGroupName.trim() || createMutation.isPending}>
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
                                    moveMutation.isPending && "opacity-50 pointer-events-none"
                                )}
                                onClick={() => handleMove(group.id)}
                            >
                                <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-left truncate">{group.name}</span>
                                <Badge variant="secondary" className="ml-auto text-xs font-normal">
                                    {group.itemCount}
                                </Badge>
                                {moveMutation.isPending && moveMutation.variables?.targetGroupId === group.id && (
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
