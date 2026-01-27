import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { watchlistClient } from '../api/client'
import { toast } from 'sonner'
import type { WatchlistGroup } from 'shared'

interface GroupManagerDialogProps {
    children: React.ReactNode
    groups: WatchlistGroup[]
    onGroupsChange: (groups: WatchlistGroup[]) => void
    onRefresh: () => void
}

export function GroupManagerDialog({ children, groups, onGroupsChange, onRefresh }: GroupManagerDialogProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!newGroupName.trim()) return
        setLoading(true)
        try {
            const newGroup = await watchlistClient.createGroup({ name: newGroupName.trim() })
            onGroupsChange([...groups, newGroup])
            onRefresh()
            setNewGroupName('')
        } catch {
            toast.error(t('watchlist.actions.create_error'))
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (id: string, name: string) => {
        setEditingId(id)
        setEditName(name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return
        try {
            const updated = await watchlistClient.updateGroup(id, editName.trim())
            onGroupsChange(groups.map(g => g.id === id ? updated : g))
            onRefresh()
            setEditingId(null)
        } catch {
            toast.error(t('watchlist.actions.update_error'))
        }
    }

    const handleDelete = async (group: WatchlistGroup) => {
        if (confirm(t('watchlist.groups.delete_confirm_desc', { name: group.name }))) {
            try {
                await watchlistClient.deleteGroup(group.id)
                onGroupsChange(groups.filter(g => g.id !== group.id))
                onRefresh()
            } catch {
                toast.error(t('watchlist.actions.delete_error'))
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('watchlist.groups.manage')}</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder={t('watchlist.groups.create_placeholder')}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button onClick={handleCreate} disabled={!newGroupName.trim() || loading}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="flex flex-col gap-2">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground shadow-sm"
                            >
                                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                    {editingId === group.id ? (
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit(group.id)
                                                if (e.key === 'Escape') cancelEdit()
                                            }}
                                            className="h-8"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="truncate font-medium">{group.name}</span>
                                    )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                    {editingId === group.id ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-600"
                                                onClick={() => saveEdit(group.id)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground"
                                                onClick={cancelEdit}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => startEdit(group.id, group.name)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(group)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
