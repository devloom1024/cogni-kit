import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Loader2, Inbox, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Empty,
    EmptyMedia,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { useSearchAssets, useWatchlistGroups, useAddWatchlistItem, watchlistKeys } from '../queries'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { watchlistClient } from '../api/client'

interface AssetSearchDialogProps {
    children: React.ReactNode
    currentGroupId: string
}

export function AssetSearchDialog({ children }: AssetSearchDialogProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query, 300)

    const { data: results, isLoading } = useSearchAssets(debouncedQuery)
    const { data: groups } = useWatchlistGroups()
    const addMutation = useAddWatchlistItem()

    const allItemsQuery = useQuery({
        queryKey: watchlistKeys.items('all'),
        queryFn: () => watchlistClient.getItems(undefined),
        enabled: open && groups !== undefined,
    })

    const handleAdd = (assetId: string, assetName: string, groupId: string, groupName: string) => {
        addMutation.mutate(
            { groupId, assetId },
            {
                onSuccess: () => {
                    toast.success(t('watchlist.actions.add_success', { asset: assetName, group: groupName }))
                },
                onError: () => {
                    toast.error(t('watchlist.actions.add_error'))
                }
            }
        )
    }

    const isAssetInGroup = (assetId: string, groupId: string): boolean => {
        if (!allItemsQuery.data) return false
        return allItemsQuery.data.some(item => item.asset.id === assetId && item.groupId === groupId)
    }

    const getAddedGroupIds = (assetId: string): string[] => {
        if (!allItemsQuery.data || !groups) return []
        const addedGroupIds: string[] = []
        groups.forEach(g => {
            if (isAssetInGroup(assetId, g.id)) {
                addedGroupIds.push(g.id)
            }
        })
        return addedGroupIds
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden top-[20%] translate-y-[0%]">
                <div className="p-4 pb-0 border-b">
                    <DialogHeader className="mb-2">
                        <DialogTitle>{t('watchlist.search.placeholder')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center border rounded-md px-3 bg-muted/50 mb-4">
                        <Search className="h-4 w-4 mr-2 opacity-50" />
                        <input
                            className="flex-1 bg-transparent border-none focus:outline-none h-10 text-sm"
                            placeholder={t('watchlist.search.placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="h-[400px] p-2">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t('common.loading')}
                        </div>
                    )}

                    {!isLoading && !debouncedQuery && (
                        <div className="flex justify-center p-8 text-muted-foreground text-sm">
                            {t('watchlist.search.start_typing', 'Type to search...')}
                        </div>
                    )}

                    {!isLoading && debouncedQuery && results && results.length === 0 && (
                        <div className="flex justify-center p-8">
                            <Empty>
                                <EmptyMedia variant="icon" className="mb-4">
                                    <Inbox className="h-6 w-6 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyHeader>
                                    <EmptyTitle>{t('watchlist.search.empty')}</EmptyTitle>
                                    <EmptyDescription>{t('watchlist.search.empty_desc', 'Try searching with a different keyword')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    )}

                    {!isLoading && results && results.length > 0 && (
                        <div className="space-y-1">
                            {results.map((asset) => {
                                const addedGroupIds = getAddedGroupIds(asset.id)
                                const availableGroups = groups?.filter(g => !addedGroupIds.includes(g.id)) || []
                                const isAdded = addedGroupIds.length > 0

                                return (
                                    <div
                                        key={asset.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted group"
                                    >
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{asset.name}</span>
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground">
                                                    {t(`watchlist.types.${asset.type}`)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono">{asset.symbol}</span>
                                                {asset.market && <span>{asset.market}</span>}
                                            </div>
                                        </div>

                                         {isAdded ? (
                                            // 已添加状态：勾 icon + 下方小字描述
                                            <div className="flex flex-col items-end gap-0.5 self-end">
                                                <Check className="h-4 w-4 text-green-600" />
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {addedGroupIds.length === 1 ? (
                                                        t('watchlist.actions.added_to_name', { name: groups?.find(g => g.id === addedGroupIds[0])?.name })
                                                    ) : (
                                                        t('watchlist.actions.in_groups', { count: addedGroupIds.length })
                                                    )}
                                                </span>
                                            </div>
                                        ) : availableGroups.length > 0 ? (
                                            // 未添加，显示 + 按钮
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                                        {t('watchlist.actions.select_group')}
                                                    </div>
                                                    {availableGroups.map(group => (
                                                        <DropdownMenuItem
                                                            key={group.id}
                                                            onClick={() => handleAdd(asset.id, asset.name, group.id, group.name)}
                                                        >
                                                            {group.name}
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                ({group.itemCount})
                                                            </span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            // 没有可用分组
                                            <div className="text-muted-foreground text-sm">
                                                {t('watchlist.actions.no_group_available')}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
