import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupManagerDialog } from './group-manager/group-manager-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WatchlistGroup } from 'shared'

export function GroupTabsSkeleton() {
    return (
        <div className="w-full mb-4 flex items-center gap-2">
            <div className="flex-1 pb-2">
                <Skeleton className="h-9 w-full rounded-md bg-muted" />
            </div>
            <div className="shrink-0 pb-2">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    )
}

interface GroupTabsProps {
    value: string
    onValueChange: (value: string) => void
    groups: WatchlistGroup[]
    onGroupsChange: (groups: WatchlistGroup[]) => void
    onRefresh: () => void
}

export function GroupTabs({ value, onValueChange, groups, onGroupsChange, onRefresh }: GroupTabsProps) {
    const { t } = useTranslation()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(false)

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setShowLeftArrow(scrollLeft > 0)
            setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [groups])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200
            const currentScroll = scrollContainerRef.current.scrollLeft
            const targetScroll = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            })
            setTimeout(checkScroll, 300)
        }
    }

    const totalCount = groups.reduce((acc, curr) => acc + curr.itemCount, 0)

    return (
        <div className="w-full mb-4">
            <Tabs value={value} onValueChange={onValueChange} className="w-full">
                <div className="flex items-center gap-2">

                    {/* Navigation Container */}
                    <div className="relative flex items-center min-w-0 bg-muted rounded-md h-9 group overflow-hidden max-w-full">

                        {/* Left Arrow */}
                        <div className={cn(
                            "absolute left-0 z-10 flex h-full items-center bg-gradient-to-r from-muted via-muted/80 to-transparent pl-1 pr-3 transition-opacity duration-200",
                            showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md bg-background/80 shadow-sm hover:bg-background"
                                onClick={() => scroll('left')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Scroll Container */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth min-h-full flex items-center"
                        >
                            <TabsList className="bg-transparent h-full p-1 w-max gap-1">
                                <TabsTrigger
                                    value="all"
                                    className="px-3 rounded-md h-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    {t('watchlist.groups.all')}
                                    <span className="ml-2 text-xs opacity-70">
                                        {totalCount}
                                    </span>
                                </TabsTrigger>
                                {groups.map(group => (
                                    <TabsTrigger
                                        key={group.id}
                                        value={group.id}
                                        className="px-3 rounded-md h-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                    >
                                        {group.name}
                                        <span className="ml-2 text-xs opacity-70">
                                            {group.itemCount}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Right Arrow */}
                        <div className={cn(
                            "absolute right-0 z-10 flex h-full items-center bg-gradient-to-l from-muted via-muted/80 to-transparent pr-1 pl-3 transition-opacity duration-200",
                            showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md bg-background/80 shadow-sm hover:bg-background"
                                onClick={() => scroll('right')}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 ml-auto">
                        <GroupManagerDialog
                            groups={groups}
                            onGroupsChange={onGroupsChange}
                            onRefresh={onRefresh}
                        >
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </GroupManagerDialog>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}
