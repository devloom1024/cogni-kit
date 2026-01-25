import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupTabs } from '@/features/watchlist/components/group-tabs'
import { WatchlistTable } from '@/features/watchlist/components/watchlist-table'
import { AssetSearchDialog } from '@/features/watchlist/components/asset-search-dialog'
import { useWatchlistItems } from '@/features/watchlist/queries' // Removed useWatchlistGroups if only used there

export function WatchlistPage() {
    const { t } = useTranslation()
    const [currentGroupId, setCurrentGroupId] = useState('all')
    // const { data: groups } = useWatchlistGroups()

    // Effectively handle default selection if needed, but 'all' is a good default
    // If we want to default to the first group if 'all' is empty? No, 'all' is fine.

    // If 'all' is selected, we might want to show all items or just aggregate? 
    // The backend doesn't support "get all items across groups" efficiently yet without a specially endpoint
    // OR we loop through groups. 
    // For MVP, let's Stick to specific group or handle 'all' by fetching all?
    // Wait, backend `getItems` takes `groupId`. `all` is not a valid UUID.
    // We should probably default to the first group if available, or handle 'all' specially.
    // Let's default to the first group id if available, else empty.

    // Removed useEffect that auto-selected first group, allowing 'all' to be selected.

    const { data: items, isLoading } = useWatchlistItems(
        currentGroupId !== 'all' ? currentGroupId : undefined
    )

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('watchlist.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('watchlist.subtitle')}
                    </p>
                </div>

                <AssetSearchDialog currentGroupId={currentGroupId}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('watchlist.search.add')}
                    </Button>
                </AssetSearchDialog>
            </div>

            <div className="flex flex-col space-y-4">
                <GroupTabs value={currentGroupId} onValueChange={setCurrentGroupId} />

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        {t('common.loading')}
                    </div>
                ) : (
                    <WatchlistTable data={items || []} />
                )}
            </div>
        </div>
    )
}
