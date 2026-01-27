import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { GroupManagerDialog } from './group-manager-dialog'
import type { WatchlistGroup } from 'shared'

interface GroupTabsProps {
    value: string
    onValueChange: (value: string) => void
    groups: WatchlistGroup[]
    onGroupsChange: (groups: WatchlistGroup[]) => void
    onRefresh: () => void
}

export function GroupTabs({ value, onValueChange, groups, onGroupsChange, onRefresh }: GroupTabsProps) {
    const { t } = useTranslation()

    const totalCount = groups.reduce((acc, curr) => acc + curr.itemCount, 0)

    return (
        <div className="w-full mb-2">
            <Tabs value={value} onValueChange={onValueChange} className="w-full">
                <div className="flex items-center gap-2">
                    <ScrollArea className="flex-1 min-w-0">
                        <div className="pb-2">
                            <TabsList className="h-10 p-1 gap-1 bg-muted rounded-md inline-flex items-center">
                                <TabsTrigger
                                    value="all"
                                    className="px-3 rounded-sm h-full"
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
                                        className="px-3 rounded-sm h-full"
                                    >
                                        {group.name}
                                        <span className="ml-2 text-xs opacity-70">
                                            {group.itemCount}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    <div className="shrink-0 pb-2">
                        <GroupManagerDialog
                            groups={groups}
                            onGroupsChange={onGroupsChange}
                            onRefresh={onRefresh}
                        >
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </GroupManagerDialog>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}
