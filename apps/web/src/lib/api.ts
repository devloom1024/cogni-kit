import axios from 'axios'
import { useUserStore } from '@/stores/useUserStore'
import { API_PATHS } from 'shared'

const api = axios.create({
    timeout: 10000,
})

// Request Interceptor: Inject Token
api.interceptors.request.use(
    (config) => {
        const { tokens } = useUserStore.getState()
        if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`
        }
        const currentLang = localStorage.getItem('i18nextLng') || 'en'
        config.headers['Accept-Language'] = currentLang
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const { tokens, setTokens } = useUserStore.getState()

                if (!tokens?.refreshToken) {
                    throw new Error('No refresh token')
                }

                // Try to refresh token
                // Use a new axios instance to avoid infinite loops
                const response = await axios.post(API_PATHS.REFRESH_TOKEN, {
                    refreshToken: tokens.refreshToken,
                })

                const newTokens = response.data
                setTokens(newTokens)

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                // Refresh failed, logout
                useUserStore.getState().clearAuth()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export { api }
