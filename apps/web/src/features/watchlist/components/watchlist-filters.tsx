import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FilterDropdown, type FilterOption } from '@/components/filter'

export interface WatchlistFilters {
    search: string
    types: string[]
    markets: string[]
}

interface WatchlistFiltersProps {
    filters: WatchlistFilters
    onFiltersChange: (filters: WatchlistFilters) => void
    className?: string
}

const ASSET_TYPES = [
    { value: 'STOCK', label: 'watchlist.types.STOCK' },
    { value: 'INDEX', label: 'watchlist.types.INDEX' },
    { value: 'ETF', label: 'watchlist.types.ETF' },
    { value: 'LOF', label: 'watchlist.types.LOF' },
    { value: 'OFUND', label: 'watchlist.types.OFUND' },
]

const MARKETS = [
    { value: 'CN', label: 'watchlist.markets.CN' },
    { value: 'HK', label: 'watchlist.markets.HK' },
    { value: 'US', label: 'watchlist.markets.US' },
]

export function WatchlistFiltersBar({ filters, onFiltersChange, className }: WatchlistFiltersProps) {
    const { t } = useTranslation()
    const [searchInput, setSearchInput] = useState(filters.search)

    // 防抖处理搜索输入
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                onFiltersChange({ ...filters, search: searchInput })
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchInput])

    // 转换选项为带翻译的格式
    const translatedAssetTypes: FilterOption[] = useMemo(
        () => ASSET_TYPES.map((type) => ({ value: type.value, label: t(type.label) })),
        [t]
    )

    const translatedMarkets: FilterOption[] = useMemo(
        () => MARKETS.map((market) => ({ value: market.value, label: t(market.label) })),
        [t]
    )

    const handleReset = () => {
        setSearchInput('')
        onFiltersChange({ search: '', types: [], markets: [] })
    }

    const hasActiveFilters = filters.search || filters.types.length > 0 || filters.markets.length > 0

    return (
        <div className={cn("flex items-center gap-2 mb-4", className)}>
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('watchlist.filters.search_placeholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* 类型过滤 - 使用通用组件 */}
            <FilterDropdown
                label={t('watchlist.filters.type')}
                options={translatedAssetTypes}
                value={filters.types}
                onChange={(types) => onFiltersChange({ ...filters, types })}
                placeholder={t('watchlist.filters.select_types')}
                searchPlaceholder={t('watchlist.filters.search_placeholder')}
                clearText={t('watchlist.filters.clear')}
                emptyText={t('watchlist.filters.no_results')}
                variant="dashed"
                showSelectedTags
                searchable
                clearable
            />

            {/* 市场过滤 - 使用通用组件 */}
            <FilterDropdown
                label={t('watchlist.filters.market')}
                options={translatedMarkets}
                value={filters.markets}
                onChange={(markets) => onFiltersChange({ ...filters, markets })}
                placeholder={t('watchlist.filters.select_markets')}
                searchPlaceholder={t('watchlist.filters.search_placeholder')}
                clearText={t('watchlist.filters.clear')}
                emptyText={t('watchlist.filters.no_results')}
                variant="dashed"
                showSelectedTags
                searchable
                clearable
            />

            {/* 重置按钮 */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    {t('watchlist.filters.reset')}
                </Button>
            )}
        </div>
    )
}
