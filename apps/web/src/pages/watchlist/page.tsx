import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { SortingState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { GroupTabs, GroupTabsSkeleton } from '@/features/watchlist/components/group-tabs'
import { WatchlistTable } from '@/features/watchlist/components/watchlist-table'
import type { WatchlistFilters } from '@/features/watchlist/components/watchlist-filters'
import { AssetSearchDialog } from '@/features/watchlist/components/asset-search-dialog'
import { GroupManagerDialog } from '@/features/watchlist/components/group-manager/group-manager-dialog'
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
    const [isGroupsLoading, setIsGroupsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([])
    const [filters, setFilters] = useState<WatchlistFilters>({
        search: '',
        types: [],
        markets: [],
    })

    const pageSize = 10

    // Load groups
    const loadGroups = useCallback(async () => {
        setIsGroupsLoading(true)
        try {
            const res = await watchlistClient.getGroups()
            setGroups(res)
        } catch (error) {
            console.error('Failed to load groups:', error)
        } finally {
            setIsGroupsLoading(false)
        }
    }, [])

    // Load items
    const loadItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await watchlistClient.getItems(
                currentGroupId !== 'all' ? currentGroupId : undefined,
                page,
                pageSize,
                {
                    search: filters.search || undefined,
                    types: filters.types.length > 0 ? filters.types : undefined,
                    markets: filters.markets.length > 0 ? filters.markets : undefined,
                    // TODO: 添加排序参数到 API
                    // sortBy: sorting[0]?.id,
                    // sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
                }
            )
            setResult(res)
        } finally {
            setLoading(false)
        }
    }, [currentGroupId, page, filters, sorting])

    useEffect(() => {
        loadGroups()
    }, [loadGroups])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    // Handle group change
    const handleGroupChange = (groupId: string) => {
        setCurrentGroupId(groupId)
        setPage(1) // 重置页码
    }

    // Handle filters change
    const handleFiltersChange = (newFilters: WatchlistFilters) => {
        setFilters(newFilters)
        setPage(1) // 重置页码
    }

    // For move dialog
    const [moveDialogOpen, setMoveDialogOpen] = useState(false)
    const [moveItemIds, setMoveItemIds] = useState<string[]>([])

    const handleMoveClick = (itemId: string) => {
        setMoveItemIds([itemId])
        setMoveDialogOpen(true)
    }

    const handleBatchMove = (itemIds: string[]) => {
        setMoveItemIds(itemIds)
        setMoveDialogOpen(true)
    }

    const handleRemove = (itemId: string) => {
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

    const handleBatchRemove = async (itemIds: string[]) => {
        try {
            const { count } = await watchlistClient.batchRemoveItems(itemIds)

            // 如果删除的数量等于当前页的数据量，且不是第一页，则跳转到上一页
            if (result && itemIds.length === result.data.length && page > 1) {
                setPage(page - 1)
            } else {
                // 否则重新加载当前页数据
                await loadItems()
            }

            // 刷新分组数据以更新条数统计
            await loadGroups()

            // Show success toast
            toast.success(t('watchlist.table.batch_remove_success', { count }))
        } catch (error) {
            console.error('Failed to batch remove items:', error)
            toast.error(t('watchlist.actions.add_error'))
        }
    }


    return (
        <div className="flex flex-col w-full px-6">
            <div className="flex items-start justify-between mb-4">
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

            {isGroupsLoading ? (
                <GroupTabsSkeleton />
            ) : (
                <GroupTabs
                    value={currentGroupId}
                    onValueChange={handleGroupChange}
                    groups={groups}
                    onGroupsChange={setGroups}
                    onRefresh={loadGroups}
                />
            )}

            {/* 过滤器 & 表格 */}
            <WatchlistTable
                data={result?.data || []}
                meta={result?.meta}
                onPageChange={setPage}
                onMoveClick={handleMoveClick}
                onRemove={handleRemove}
                onBatchRemove={handleBatchRemove}
                onBatchMove={handleBatchMove}
                currentGroupId={currentGroupId}
                loading={loading}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                sorting={sorting}
                onSortingChange={setSorting}
            />


            {/* Move Dialog */}

            <GroupManagerDialog
                open={moveDialogOpen}
                onOpenChange={setMoveDialogOpen}
                groups={groups}
                onGroupsChange={setGroups}
                onRefresh={loadGroups}
                mode="select"
                title={t('watchlist.actions.move_to_title')}
                currentGroupId={currentGroupId !== 'all' ? currentGroupId : undefined}
                onSelect={async (group) => {
                    try {
                        if (moveItemIds.length === 1) {
                            await watchlistClient.moveItem(moveItemIds[0], group.id)
                        } else {
                            await watchlistClient.batchMoveItems(moveItemIds, group.id)
                        }
                        toast.success(t('watchlist.actions.move_success'))
                        setMoveDialogOpen(false)
                        loadItems()
                        loadGroups()
                    } catch {
                        toast.error(t('watchlist.actions.move_error'))
                    }
                }}
            />
        </div>
    )
}
