import { api } from './api'
import type {
    LoginRequest,
    RegisterRequest,
    SendCodeRequest,
    ForgotPasswordRequest,
    AuthResponse,
    SendCodeResponse,
    SocialProvider,
    OAuthCallbackRequest
} from 'shared'

export const authClient = {
    login: async (data: LoginRequest) => {
        const res = await api.post<AuthResponse>('/auth/login', data)
        return res.data
    },

    register: async (data: RegisterRequest) => {
        const res = await api.post<AuthResponse>('/auth/register', data)
        return res.data
    },

    sendCode: async (data: SendCodeRequest) => {
        const res = await api.post<SendCodeResponse>('/auth/send-code', data)
        return res.data
    },

    forgotPassword: async (data: ForgotPasswordRequest) => {
        const res = await api.post<SendCodeResponse>('/auth/forgot-password', data)
        return res.data
    },

    logout: async () => {
        await api.post('/auth/logout')
    },

    getOAuthUrl: async (provider: SocialProvider) => {
        const res = await api.get<{ url: string }>(`/auth/${provider}/url`)
        return res.data
    },

    oauthCallback: async (provider: SocialProvider, data: OAuthCallbackRequest) => {
        const res = await api.post<AuthResponse & { isNewUser: boolean }>(`/auth/${provider}/callback`, data)
        return res.data
    }
}
