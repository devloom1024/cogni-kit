import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { GroupManagerDialog } from './group-manager-dialog'
import { useWatchlistGroups } from '../queries'

interface GroupTabsProps {
    value: string
    onValueChange: (value: string) => void
}

export function GroupTabs({ value, onValueChange }: GroupTabsProps) {
    const { t } = useTranslation()
    const { data: groups } = useWatchlistGroups()

    const totalCount = groups?.reduce((acc, curr) => acc + curr.itemCount, 0) || 0

    return (
        <div className="w-full mb-2">
            <Tabs value={value} onValueChange={onValueChange} className="w-full">
                <div className="flex items-center gap-2">
                    <ScrollArea className="flex-1 min-w-0">
                        <div className="pb-2">
                            <TabsList className="bg-transparent p-0 h-auto gap-2 justify-start inline-flex">
                                <TabsTrigger
                                    value="all"
                                    className="border border-border bg-background hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 h-9 whitespace-nowrap"
                                >
                                    {t('watchlist.groups.all')}
                                    <span className="ml-2 text-xs opacity-70">
                                        {totalCount}
                                    </span>
                                </TabsTrigger>
                                {groups?.map(group => (
                                    <TabsTrigger
                                        key={group.id}
                                        value={group.id}
                                        className="border border-border bg-background hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 h-9 whitespace-nowrap"
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
                        <GroupManagerDialog>
                            <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </GroupManagerDialog>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}
