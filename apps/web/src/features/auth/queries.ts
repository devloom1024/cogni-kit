import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { useUserStore } from '@/stores/useUserStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { SocialProvider } from 'shared'

export const useLogin = () => {
    const { setAuth } = useUserStore()
    const navigate = useNavigate()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: authClient.login,
        onSuccess: (data) => {
            setAuth(data.user, data.tokens)
            toast.success(t('auth.login.success', { defaultValue: 'Login successful' }))
            navigate('/')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Login failed')
        }
    })
}

export const useRegister = () => {
    const { setAuth } = useUserStore()
    const navigate = useNavigate()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: authClient.register,
        onSuccess: (data) => {
            setAuth(data.user, data.tokens)
            toast.success(t('auth.register.success', { defaultValue: 'Registration successful' }))
            navigate('/')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Registration failed')
        }
    })
}

export const useSendCode = () => {
    const { t } = useTranslation()
    return useMutation({
        mutationFn: authClient.sendCode,
        onSuccess: () => {
            toast.success(t('auth.code_sent', { defaultValue: 'Verification code sent' }))
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send code')
        }
    })
}

export const useForgotPassword = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: authClient.forgotPassword,
        onSuccess: () => {
            toast.success(t('auth.password_reset', { defaultValue: 'Password reset successfully' }))
            navigate('/login')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Reset failed')
        }
    })
}

export const useLogout = () => {
    const { clearAuth } = useUserStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authClient.logout,
        onSettled: () => {
            clearAuth()
            queryClient.clear()
            navigate('/login')
        }
    })
}

export const useOAuthUrl = () => {
    return useMutation({
        mutationFn: authClient.getOAuthUrl,
    })
}

export const useOAuthLogin = () => {
    const { setAuth } = useUserStore()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (params: { provider: SocialProvider, code: string, redirectUri?: string }) =>
            authClient.oauthCallback(params.provider, {
                code: params.code,
                redirectUri: params.redirectUri
            }),
        onSuccess: (data) => {
            setAuth(data.user, data.tokens)
            navigate('/')
        }
    })
}
