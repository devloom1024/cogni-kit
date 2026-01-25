import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { watchlistClient } from './api/client'
import type { CreateWatchlistGroupRequest } from 'shared'

export const watchlistKeys = {
    all: ['watchlist'] as const,
    groups: () => [...watchlistKeys.all, 'groups'] as const,
    items: (groupId: string) => [...watchlistKeys.all, 'items', groupId] as const,
    search: (query: string, type?: string, market?: string) =>
        ['assets', 'search', query, type, market] as const,
}

// ==================== Groups ====================

export const useWatchlistGroups = () => {
    return useQuery({
        queryKey: watchlistKeys.groups(),
        queryFn: watchlistClient.getGroups,
    })
}

export const useCreateWatchlistGroup = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateWatchlistGroupRequest) => watchlistClient.createGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() })
        },
    })
}

export const useUpdateWatchlistGroup = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            watchlistClient.updateGroup(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() })
        },
    })
}

export const useDeleteWatchlistGroup = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => watchlistClient.deleteGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() })
        },
    })
}

export const useReorderWatchlistGroups = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (orders: { id: string; sortOrder: number }[]) =>
            watchlistClient.reorderGroups(orders),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() })
        },
    })
}

// ==================== Items ====================

export const useWatchlistItems = (groupId: string | undefined) => {
    return useQuery({
        queryKey: watchlistKeys.items(groupId || 'all'),
        queryFn: () => watchlistClient.getItems(groupId),
    })
}

export const useAddWatchlistItem = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ groupId, assetId }: { groupId: string; assetId: string }) =>
            watchlistClient.addItem(groupId, assetId),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.items(groupId) })
            queryClient.invalidateQueries({ queryKey: watchlistKeys.items('all') }) // Refresh 'all' list
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() }) // Refresh counts
        },
    })
}

export const useRemoveWatchlistItem = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ itemId }: { itemId: string; groupId: string }) =>
            watchlistClient.removeItem(itemId),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.items(groupId) })
            queryClient.invalidateQueries({ queryKey: watchlistKeys.items('all') }) // Refresh 'all' list
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() }) // Refresh counts
        },
    })
}

export const useMoveWatchlistItem = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ itemId, targetGroupId }: { itemId: string; targetGroupId: string }) =>
            watchlistClient.moveItem(itemId, targetGroupId),
        onSuccess: (_, { targetGroupId }) => {
            queryClient.invalidateQueries({ queryKey: watchlistKeys.items(targetGroupId) })
            queryClient.invalidateQueries({ queryKey: watchlistKeys.groups() })
            queryClient.invalidateQueries({ queryKey: watchlistKeys.all })
        },
    })
}

// ==================== Search ====================

export const useSearchAssets = (query: string, type?: string, market?: string) => {
    return useQuery({
        queryKey: watchlistKeys.search(query, type, market),
        queryFn: () => watchlistClient.searchAssets(query, type, market),
        enabled: query.length > 0,
        staleTime: 1000 * 60, // Cache for 1 minute
    })
}
