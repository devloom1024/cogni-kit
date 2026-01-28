import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { WatchlistGroup } from 'shared'

interface SelectGroupListProps {
    groups: WatchlistGroup[]
    selectedGroupId?: string
    onSelect: (group: WatchlistGroup) => void
    loadingId?: string | null
}

export function SelectGroupList({
    groups,
    onSelect,
    loadingId,
    selectedGroupId
}: SelectGroupListProps) {
    const { t } = useTranslation() // We need t for "Current" label

    return (
        <div className="flex flex-col gap-2">
            {groups.map((group) => {
                const isLoading = loadingId === group.id
                const isCurrent = selectedGroupId === group.id

                return (
                    <div
                        key={group.id}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors",
                            (isLoading || isCurrent) ? "opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        )}
                        onClick={() => !isCurrent && onSelect(group)}
                    >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate font-medium text-sm">
                                    {group.name}
                                    {isCurrent && (
                                        <Badge variant="secondary" className="ml-2 text-xs font-normal pointer-events-none">
                                            {t('watchlist.groups.current')}
                                        </Badge>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full min-w-8 text-center">
                                {group.itemCount}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
