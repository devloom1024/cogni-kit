import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, X, Check, Loader2, Inbox, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import {
    Empty,
    EmptyMedia,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { watchlistClient } from '../api/client'
import { toast } from 'sonner'
import type { WatchlistGroup } from 'shared'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface GroupManagerDialogProps {
    children: React.ReactNode
    groups: WatchlistGroup[]
    onGroupsChange: (groups: WatchlistGroup[]) => void
    onRefresh: () => void
}

interface SortableGroupItemProps {
    group: WatchlistGroup
    editingId: string | null
    editName: string
    opLoadingId: string | null
    setEditName: (name: string) => void
    saveEdit: (id: string) => void
    cancelEdit: () => void
    startEdit: (id: string, name: string) => void
    handleDeleteClick: (group: WatchlistGroup) => void
}

function SortableGroupItem({
    group,
    editingId,
    editName,
    opLoadingId,
    setEditName,
    saveEdit,
    cancelEdit,
    startEdit,
    handleDeleteClick
}: SortableGroupItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: group.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.5 : 1,
    }

    const { t } = useTranslation()

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground shadow-sm group relative"
        >
            <div className="flex items-center gap-2 flex-1 overflow-hidden ml-1">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-muted-foreground hover:text-foreground touch-none flex-shrink-0"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

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
                        disabled={opLoadingId === group.id}
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
                            disabled={opLoadingId === group.id}
                        >
                            {opLoadingId === group.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={cancelEdit}
                            disabled={opLoadingId === group.id}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => startEdit(group.id, group.name)}
                            disabled={opLoadingId === group.id}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteClick(group)}
                            disabled={opLoadingId === group.id}
                        >
                            {opLoadingId === group.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

export function GroupManagerDialog({ children, groups, onGroupsChange, onRefresh }: GroupManagerDialogProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [createLoading, setCreateLoading] = useState(false)
    const [opLoadingId, setOpLoadingId] = useState<string | null>(null)

    // Alert Dialog State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [groupToDelete, setGroupToDelete] = useState<WatchlistGroup | null>(null)

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleCreate = async () => {
        if (!newGroupName.trim()) return
        setCreateLoading(true)
        try {
            const newGroup = await watchlistClient.createGroup({ name: newGroupName.trim() })
            onGroupsChange([...groups, newGroup])
            onRefresh()
            setNewGroupName('')
            toast.success(t('watchlist.actions.create_success'))
        } catch {
            toast.error(t('watchlist.actions.create_error'))
        } finally {
            setCreateLoading(false)
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
        setOpLoadingId(id)
        try {
            const updated = await watchlistClient.updateGroup(id, editName.trim())
            onGroupsChange(groups.map(g => g.id === id ? updated : g))
            onRefresh()
            setEditingId(null)
            toast.success(t('watchlist.actions.update_success', 'Updated successfully'))
        } catch {
            toast.error(t('watchlist.actions.update_error'))
        } finally {
            setOpLoadingId(null)
        }
    }

    const handleDeleteClick = (group: WatchlistGroup) => {
        setGroupToDelete(group)
        setDeleteConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!groupToDelete) return

        setOpLoadingId(groupToDelete.id)
        try {
            await watchlistClient.deleteGroup(groupToDelete.id)
            onGroupsChange(groups.filter(g => g.id !== groupToDelete.id))
            onRefresh()
            setDeleteConfirmOpen(false)
            setGroupToDelete(null)
            toast.success(t('watchlist.actions.delete_success', 'Deleted successfully'))
        } catch {
            toast.error(t('watchlist.actions.delete_error'))
        } finally {
            setOpLoadingId(null)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = groups.findIndex((g) => g.id === active.id)
            const newIndex = groups.findIndex((g) => g.id === over.id)

            const newGroups = arrayMove(groups, oldIndex, newIndex)
            onGroupsChange(newGroups)

            // Calculate new orders
            // 简单的处理方式：全量更新或者只更新受影响的
            // 这里我们假设后端接受一组包含 id 和 sortOrder 的对象
            const orders = newGroups.map((g, index) => ({
                id: g.id,
                sortOrder: index + 1
            }))

            try {
                await watchlistClient.reorderGroups(orders)
                // 不需要 toast，因为拖拽通常期望是即时的且无干扰的
                // 仅仅在失败时提示
            } catch (error) {
                console.error('Failed to reorder groups', error)
                toast.error(t('watchlist.groups.reorder_error', 'Failed to update order'))
                // Revert on error
                onGroupsChange(groups) // groups 还是旧的引用（如果我们在外层没有更新的话，但这里 groups 是 prop）
                // 实际上因为 onGroupsChange 更新了父组件状态，这里的 groups prop 会变。
                // 如果我们要回滚，最好是重新 fetch 或者能够撤销。
                // 简单起见，失败后调用 onRefresh 重新拉取正确顺序
                onRefresh()
            }
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('watchlist.groups.manage')}</DialogTitle>
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
                        {groups.length === 0 ? (
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
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={groups.map(g => g.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col gap-2">
                                        {groups.map((group) => (
                                            <SortableGroupItem
                                                key={group.id}
                                                group={group}
                                                editingId={editingId}
                                                editName={editName}
                                                opLoadingId={opLoadingId}
                                                setEditName={setEditName}
                                                saveEdit={saveEdit}
                                                cancelEdit={cancelEdit}
                                                startEdit={startEdit}
                                                handleDeleteClick={handleDeleteClick}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('watchlist.groups.delete_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('watchlist.groups.delete_confirm_desc', { name: groupToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={opLoadingId === groupToDelete?.id}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleConfirmDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={opLoadingId === groupToDelete?.id}
                        >
                            {opLoadingId === groupToDelete?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('watchlist.groups.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
