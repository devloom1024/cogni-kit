import { api } from '@/lib/api'
import { API_PATHS } from 'shared'
import type {
    AssetSearchResult,
    WatchlistGroup,
    WatchlistItem,
    CreateWatchlistGroupRequest
} from 'shared'

export const watchlistClient = {
    // ==================== 标的搜索 ====================
    searchAssets: async (query: string, type?: string, market?: string) => {
        const params = new URLSearchParams({ q: query })
        if (type) params.append('type', type)
        if (market) params.append('market', market)

        const res = await api.get<AssetSearchResult[]>(
            `${API_PATHS.ASSET_SEARCH}?${params}`
        )
        return res.data
    },

    // ==================== 分组管理 ====================
    getGroups: async () => {
        const res = await api.get<WatchlistGroup[]>(API_PATHS.WATCHLIST_GROUPS)
        return res.data
    },

    createGroup: async (data: CreateWatchlistGroupRequest) => {
        const res = await api.post<WatchlistGroup>(API_PATHS.WATCHLIST_GROUPS, data)
        return res.data
    },

    updateGroup: async (groupId: string, name: string) => {
        const res = await api.put<WatchlistGroup>(
            `${API_PATHS.WATCHLIST_GROUPS}/${groupId}`,
            { name }
        )
        return res.data
    },

    deleteGroup: async (groupId: string) => {
        await api.delete(`${API_PATHS.WATCHLIST_GROUPS}/${groupId}`)
    },

    reorderGroups: async (orders: { id: string; sortOrder: number }[]) => {
        await api.patch(API_PATHS.WATCHLIST_GROUPS_REORDER, { orders })
    },

    // ==================== 标的管理 ====================
    getItems: async (groupId?: string) => {
        const url = groupId && groupId !== 'all'
            ? API_PATHS.WATCHLIST_GROUP_ITEMS(groupId)
            : API_PATHS.WATCHLIST_ITEMS

        const res = await api.get<WatchlistItem[]>(url)
        return res.data
    },

    addItem: async (groupId: string, assetId: string) => {
        const res = await api.post<WatchlistItem>(
            API_PATHS.WATCHLIST_GROUP_ITEMS(groupId),
            { assetId }
        )
        return res.data
    },

    removeItem: async (itemId: string) => {
        await api.delete(API_PATHS.WATCHLIST_ITEM(itemId))
    },

    moveItem: async (itemId: string, targetGroupId: string) => {
        const res = await api.patch<WatchlistItem>(
            API_PATHS.WATCHLIST_ITEM_MOVE(itemId),
            { targetGroupId }
        )
        return res.data
    },
}
