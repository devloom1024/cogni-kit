import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    loadingId
}: SelectGroupListProps) {
    return (
        <div className="flex flex-col gap-2">
            {groups.map((group) => {
                const isLoading = loadingId === group.id

                return (
                    <div
                        key={group.id}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                            isLoading && "opacity-50 pointer-events-none"
                        )}
                        onClick={() => onSelect(group)}
                    >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate font-medium text-sm">{group.name}</span>
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
