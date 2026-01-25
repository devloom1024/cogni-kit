import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Loader2, Inbox } from 'lucide-react'
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
import { useSearchAssets, useWatchlistGroups, useAddWatchlistItem } from '../queries'
import { useDebounce } from '@/hooks/use-debounce' // Assuming this exists or I use local timeout

interface AssetSearchDialogProps {
    children: React.ReactNode
    currentGroupId: string
}

export function AssetSearchDialog({ children, currentGroupId }: AssetSearchDialogProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query, 300)

    // Only search if query is long enough
    const { data: results, isLoading } = useSearchAssets(debouncedQuery)
    const { data: groups } = useWatchlistGroups()
    const addMutation = useAddWatchlistItem()

    const handleAdd = (assetId: string, groupId: string) => {
        addMutation.mutate(
            { groupId, assetId },
            {
                onSuccess: () => {
                    // Optional toast
                }
            }
        )
    }

    // Determine target group logic
    // If currentGroupId is specific, add directly.
    // If 'all', default to first group or require selection? 
    // For smoothness, if 'all', we force user to pick via dropdown (or show dropdown on click).
    // Here we implement: click (+) -> if current specific, add. if all, open dropdown.

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
                            {results.map((asset) => (
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

                                    {currentGroupId !== 'all' ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleAdd(asset.id, currentGroupId)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {groups?.map(group => (
                                                    <DropdownMenuItem
                                                        key={group.id}
                                                        onClick={() => handleAdd(asset.id, group.id)}
                                                    >
                                                        {t('watchlist.actions.move_to')} {group.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
