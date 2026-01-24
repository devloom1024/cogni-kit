import { BrowserRouter, Route, Routes, Outlet, Link, Navigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeSwitch } from "@/components/theme/ThemeSwitch"
import { LanguageSwitch } from "@/components/theme/LanguageSwitch"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage"
import { useUserStore } from "@/stores/useUserStore"

function DashboardLayout() {
  const { user } = useUserStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background text-foreground transition-colors duration-300">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Link to="/" className="text-xl font-bold">CogniKit</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <LanguageSwitch />
          </div>
        </header>
        <main className="container mx-auto py-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AuthLayout() {
  const { user } = useUserStore()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <header className="flex h-16 items-center justify-end px-6 absolute top-0 right-0 w-full">
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <LanguageSwitch />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
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
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<AuthLayout />}>
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
