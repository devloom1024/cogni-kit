import { api } from './api'
import { API_PATHS } from 'shared'
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
        const res = await api.post<AuthResponse>(API_PATHS.LOGIN, data)
        return res.data
    },

    register: async (data: RegisterRequest) => {
        const res = await api.post<AuthResponse>(API_PATHS.REGISTER, data)
        return res.data
    },

    sendCode: async (data: SendCodeRequest) => {
        const res = await api.post<SendCodeResponse>(API_PATHS.SEND_CODE, data)
        return res.data
    },

    forgotPassword: async (data: ForgotPasswordRequest) => {
        const res = await api.post<SendCodeResponse>(API_PATHS.FORGOT_PASSWORD, data)
        return res.data
    },

    logout: async () => {
        await api.post(API_PATHS.LOGOUT)
    },

    getOAuthUrl: async (provider: SocialProvider) => {
        const res = await api.get<{ url: string }>(API_PATHS.OAUTH_URL(provider))
        return res.data
    },

    oauthCallback: async (provider: SocialProvider, data: OAuthCallbackRequest) => {
        const res = await api.post<AuthResponse & { isNewUser: boolean }>(API_PATHS.OAUTH_CALLBACK(provider), data)
        return res.data
    }
}
