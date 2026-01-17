import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, TokenPair } from 'shared'

interface UserState {
    user: User | null
    tokens: TokenPair | null
    setUser: (user: User) => void
    setTokens: (tokens: TokenPair) => void
    setAuth: (user: User, tokens: TokenPair) => void
    clearAuth: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            tokens: null,
            setUser: (user) => set({ user }),
            setTokens: (tokens) => set({ tokens }),
            setAuth: (user, tokens) => set({ user, tokens }),
            clearAuth: () => set({ user: null, tokens: null }),
        }),
        {
            name: 'cogni-auth-storage',
        }
    )
)
