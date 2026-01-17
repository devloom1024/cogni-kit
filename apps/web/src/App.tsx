import { BrowserRouter, Route, Routes, Outlet, Link } from "react-router-dom"
import { ThemeSwitch } from "@/components/theme/ThemeSwitch"
import { LanguageSwitch } from "@/components/theme/LanguageSwitch"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/stores/useUserStore"
import { useLogout } from "@/features/auth/queries"
import { useTranslation } from "react-i18next"

function Layout() {
  const { user } = useUserStore()
  const { mutate: logout } = useLogout()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Link to="/" className="text-xl font-bold">CogniKit</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.nickname || user.username}</span>
              <Button variant="ghost" onClick={() => logout()}>Logout</Button>
            </div>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/login">{t('auth.login.submit')}</Link>
            </Button>
          )}
          <ThemeSwitch />
          <LanguageSwitch />
        </div>
      </header>
      <main className="container mx-auto py-8">
        <Outlet />
      </main>
    </div>
  )
}

function Home() {
  const { user } = useUserStore()
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        CogniKit
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Your Personal AI Toolbox
      </p>
      {user && (
        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
          <pre className="text-sm overflow-auto max-w-lg">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/callback/:provider" element={<OAuthCallbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
