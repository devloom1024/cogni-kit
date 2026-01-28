import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Inbox, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Empty,
    EmptyMedia,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { watchlistClient } from '../../api/client'
import { toast } from 'sonner'
import type { WatchlistGroup } from 'shared'
import { ManageGroupList } from './manage-group-list'
import { SelectGroupList } from './select-group-list'

export interface GroupManagerDialogProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    groups: WatchlistGroup[]
    onGroupsChange: (groups: WatchlistGroup[]) => void
    onRefresh: () => void

    // New props for reuse
    mode?: 'manage' | 'select'
    title?: string // Custom title override
    onSelect?: (group: WatchlistGroup) => Promise<void> | void
    excludeGroupId?: string
}

export function GroupManagerDialog({
    children,
    groups,
    onGroupsChange,
    onRefresh,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    mode = 'manage',
    title,
    onSelect,
    excludeGroupId
}: GroupManagerDialogProps) {
    const { t } = useTranslation()
    const [internalOpen, setInternalOpen] = useState(false)

    // Normalize open state
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const setOpen = (val: boolean) => {
        if (isControlled) {
            setControlledOpen?.(val)
        } else {
            setInternalOpen(val)
        }
    }

    const [newGroupName, setNewGroupName] = useState('')
    const [createLoading, setCreateLoading] = useState(false)
    const [opLoadingId, setOpLoadingId] = useState<string | null>(null)

    const displayGroups = excludeGroupId
        ? groups.filter(g => g.id !== excludeGroupId)
        : groups

    const handleCreate = async () => {
        if (!newGroupName.trim()) return
        setCreateLoading(true)
        try {
            const newGroup = await watchlistClient.createGroup({ name: newGroupName.trim() })
            onGroupsChange([...groups, newGroup]) // Add to full list
            onRefresh()
            setNewGroupName('')
            toast.success(t('watchlist.actions.create_success'))
        } catch {
            toast.error(t('watchlist.actions.create_error'))
        } finally {
            setCreateLoading(false)
        }
    }

    const handleUpdate = async (id: string, name: string) => {
        if (!name.trim()) return
        setOpLoadingId(id)
        try {
            const updated = await watchlistClient.updateGroup(id, name.trim())
            onGroupsChange(groups.map(g => g.id === id ? updated : g))
            onRefresh()
            toast.success(t('watchlist.actions.update_success'))
        } catch {
            toast.error(t('watchlist.actions.update_error'))
        } finally {
            setOpLoadingId(null)
        }
    }

    const handleDelete = async (id: string) => {
        setOpLoadingId(id)
        try {
            await watchlistClient.deleteGroup(id)
            onGroupsChange(groups.filter(g => g.id !== id))
            onRefresh()
            toast.success(t('watchlist.actions.delete_success'))
        } catch {
            toast.error(t('watchlist.actions.delete_error'))
        } finally {
            setOpLoadingId(null)
        }
    }

    const handleReorder = async (newGroups: WatchlistGroup[]) => {
        onGroupsChange(newGroups)

        try {
            const orders = newGroups.map((g, index) => ({
                id: g.id,
                sortOrder: index + 1
            }))
            await watchlistClient.reorderGroups(orders)
        } catch (error) {
            console.error('Failed to reorder groups', error)
            toast.error(t('watchlist.groups.reorder_error'))
            onRefresh()
        }
    }

    const handleSelect = async (group: WatchlistGroup) => {
        if (onSelect) {
            setOpLoadingId(group.id)
            try {
                await onSelect(group)
            } finally {
                setOpLoadingId(null)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title || t('watchlist.groups.manage')}</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mt-4 mb-2">
                    <Input
                        placeholder={t('watchlist.groups.create_placeholder')}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button onClick={handleCreate} disabled={!newGroupName.trim() || createLoading}>
                        {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>

                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    {displayGroups.length === 0 ? (
                        <Empty>
                            <EmptyMedia variant="icon" className="mb-2">
                                <Inbox className="h-6 w-6 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle className="text-sm">{t('watchlist.groups.empty', 'No groups')}</EmptyTitle>
                                <EmptyDescription className="text-xs">{t('watchlist.groups.empty_desc', 'Create a group to categorize your assets')}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        mode === 'manage' ? (
                            <ManageGroupList
                                groups={displayGroups}
                                onReorder={handleReorder}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                                loadingId={opLoadingId}
                            />
                        ) : (
                            <SelectGroupList
                                groups={displayGroups}
                                onSelect={handleSelect}
                                loadingId={opLoadingId}
                            />
                        )
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
