import { useOAuthLogin } from "@/features/auth/queries"
import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { SocialProvider } from "shared"
import { useTranslation } from "react-i18next"

export function OAuthCallbackPage() {
    const { provider } = useParams<{ provider: SocialProvider }>()
    const [searchParams] = useSearchParams()
    const code = searchParams.get('code')
    const { mutate: login, isPending, error } = useOAuthLogin()
    const navigate = useNavigate()
    const { t } = useTranslation()

    useEffect(() => {
        if (provider && code) {
            login({ provider, code, redirectUri: window.location.origin + `/auth/callback/${provider}` })
        } else {
            // navigate('/login')
        }
    }, [provider, code, login])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {isPending ? (
                <div className="text-xl">{t('common.loading')}</div>
            ) : error ? (
                <div className="text-red-500">
                    Login failed: {error.message}
                    <br />
                    <button onClick={() => navigate('/login')} className="underline">Back to Login</button>
                </div>
            ) : (
                <div>Processing...</div>
            )}
        </div>
    )
}
