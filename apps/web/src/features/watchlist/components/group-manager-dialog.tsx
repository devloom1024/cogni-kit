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
import {
    useWatchlistGroups,
    useCreateWatchlistGroup,
    useUpdateWatchlistGroup,
    useDeleteWatchlistGroup,
} from '../queries'
import { toast } from 'sonner'

export function GroupManagerDialog({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation()
    const { data: groups } = useWatchlistGroups()
    const createMutation = useCreateWatchlistGroup()
    const updateMutation = useUpdateWatchlistGroup()
    const deleteMutation = useDeleteWatchlistGroup()

    const [newGroupName, setNewGroupName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const handleCreate = () => {
        if (!newGroupName.trim()) return
        createMutation.mutate(
            { name: newGroupName.trim() },
            {
                onSuccess: () => setNewGroupName(''),
            }
        )
    }

    const startEdit = (id: string, name: string) => {
        setEditingId(id)
        setEditName(name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const saveEdit = (id: string) => {
        if (!editName.trim()) return
        updateMutation.mutate(
            { id, name: editName.trim() },
            {
                onSuccess: () => setEditingId(null),
            }
        )
    }

    const handleDelete = (group: { id: string; name: string }) => {
        if (confirm(t('watchlist.groups.delete_confirm_desc', { name: group.name }))) {
            deleteMutation.mutate(group.id)
        }
    }

    return (
        <Dialog>
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
                    <Button onClick={handleCreate} disabled={!newGroupName.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="flex flex-col gap-2">
                        {groups?.map((group) => (
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
