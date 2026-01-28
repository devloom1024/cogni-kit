import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    GripVertical,
    Pencil,
    Trash2,
    Check,
    X,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { WatchlistGroup } from 'shared'

// --- Sortable Item Component ---

interface SortableGroupItemProps {
    group: WatchlistGroup
    editingId: string | null
    editName: string
    opLoadingId: string | null
    setEditName: (name: string) => void
    saveEdit: (id: string, name: string) => void
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
                    className="cursor-move text-muted-foreground hover:text-foreground touch-none shrink-0"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {editingId === group.id ? (
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(group.id, editName)
                            if (e.key === 'Escape') cancelEdit()
                        }}
                        className="h-8"
                        autoFocus
                        disabled={opLoadingId === group.id}
                        onClick={(e) => e.stopPropagation()}
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
                            onClick={(e) => {
                                e.stopPropagation()
                                saveEdit(group.id, editName)
                            }}
                            disabled={opLoadingId === group.id}
                        >
                            {opLoadingId === group.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={(e) => {
                                e.stopPropagation()
                                cancelEdit()
                            }}
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
                            onClick={(e) => {
                                e.stopPropagation()
                                startEdit(group.id, group.name)
                            }}
                            disabled={opLoadingId === group.id}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(group)
                            }}
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

// --- Main List Component ---

interface ManageGroupListProps {
    groups: WatchlistGroup[]
    onReorder: (newGroups: WatchlistGroup[]) => Promise<void>
    onUpdate: (id: string, name: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
    loadingId?: string | null
}

export function ManageGroupList({
    groups,
    onReorder,
    onUpdate,
    onDelete,
    loadingId
}: ManageGroupListProps) {
    const { t } = useTranslation()

    // Internal state for editing and deletion UI
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [groupToDelete, setGroupToDelete] = useState<WatchlistGroup | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const startEdit = (id: string, name: string) => {
        setEditingId(id)
        setEditName(name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const handleSaveEdit = async (id: string, name: string) => {
        await onUpdate(id, name)
        setEditingId(null)
    }

    const handleDeleteClick = (group: WatchlistGroup) => {
        setGroupToDelete(group)
        setDeleteConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!groupToDelete) return
        await onDelete(groupToDelete.id)
        setDeleteConfirmOpen(false)
        setGroupToDelete(null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = groups.findIndex((g) => g.id === active.id)
            const newIndex = groups.findIndex((g) => g.id === over.id)
            const newGroups = arrayMove(groups, oldIndex, newIndex)
            await onReorder(newGroups)
        }
    }

    return (
        <>
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
                                opLoadingId={loadingId ?? null}
                                setEditName={setEditName}
                                saveEdit={handleSaveEdit}
                                cancelEdit={cancelEdit}
                                startEdit={startEdit}
                                handleDeleteClick={handleDeleteClick}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('watchlist.groups.delete_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('watchlist.groups.delete_confirm_desc', { name: groupToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loadingId === groupToDelete?.id}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleConfirmDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={loadingId === groupToDelete?.id}
                        >
                            {loadingId === groupToDelete?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('watchlist.groups.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
