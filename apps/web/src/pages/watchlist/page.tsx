import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupTabs } from '@/features/watchlist/components/group-tabs'
import { WatchlistTable } from '@/features/watchlist/components/watchlist-table'
import { AssetSearchDialog } from '@/features/watchlist/components/asset-search-dialog'
import { GroupManagerDialog } from '@/features/watchlist/components/group-manager-dialog'
import { MoveToGroupDialog } from '@/features/watchlist/components/move-to-group-dialog'
import { watchlistClient } from '@/features/watchlist/api/client'
import type { PaginationMeta, WatchlistGroup, WatchlistItem } from 'shared'

interface PaginatedResult {
    data: WatchlistItem[]
    meta: PaginationMeta
}

export function WatchlistPage() {
    const { t } = useTranslation()
    const [currentGroupId, setCurrentGroupId] = useState('all')
    const [page, setPage] = useState(1)
    const [result, setResult] = useState<PaginatedResult | null>(null)
    const [groups, setGroups] = useState<WatchlistGroup[]>([])
    const [loading, setLoading] = useState(false)

    const pageSize = 10

    // Load groups
    const loadGroups = useCallback(async () => {
        try {
            const res = await watchlistClient.getGroups()
            setGroups(res)
        } catch (error) {
            console.error('Failed to load groups:', error)
        }
    }, [])

    // Load items
    const loadItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await watchlistClient.getItems(
                currentGroupId !== 'all' ? currentGroupId : undefined,
                page,
                pageSize
            )
            setResult(res)
        } finally {
            setLoading(false)
        }
    }, [currentGroupId, page])

    useEffect(() => {
        loadGroups()
    }, [loadGroups])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    const handleGroupChange = (groupId: string) => {
        setCurrentGroupId(groupId)
        setPage(1)
    }

    // For move dialog
    const [moveDialogOpen, setMoveDialogOpen] = useState(false)
    const [moveItemId, setMoveItemId] = useState<string | null>(null)

    const handleMoveClick = (itemId: string) => {
        setMoveItemId(itemId)
        setMoveDialogOpen(true)
    }

    const handleRemove = (itemId: string, groupId: string) => {
        // Remove from local result
        if (result) {
            setResult({
                ...result,
                data: result.data.filter(item => item.id !== itemId),
                meta: {
                    ...result.meta,
                    total: result.meta.total - 1,
                }
            })
        }
    }

    return (
        <div className="flex flex-col h-full w-full px-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('watchlist.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('watchlist.subtitle')}
                    </p>
                </div>

                <AssetSearchDialog
                    currentGroupId={currentGroupId}
                    groups={groups}
                    onItemAdded={loadItems}
                    onItemRemoved={loadItems}
                >
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('watchlist.search.add')}
                    </Button>
                </AssetSearchDialog>
            </div>

            <GroupTabs
                value={currentGroupId}
                onValueChange={handleGroupChange}
                groups={groups}
            />

          {loading ? (
            <div className="flex items-center justify-center p-8">
              {t('common.loading')}
            </div>
          ) : (
            <WatchlistTable
              data={result?.data || []}
              meta={result?.meta}
              onPageChange={setPage}
              onMoveClick={handleMoveClick}
              onRemove={handleRemove}
              currentGroupId={currentGroupId}
            />
          )}

            {/* Dialogs */}
            <GroupManagerDialog
                groups={groups}
                onGroupsChange={setGroups}
                onRefresh={loadGroups}
            />

            <MoveToGroupDialog
                itemId={moveItemId || ''}
                currentGroupId={currentGroupId}
                open={moveDialogOpen}
                onOpenChange={setMoveDialogOpen}
                groups={groups}
                onSuccess={loadItems}
            />
        </div>
    )
}
