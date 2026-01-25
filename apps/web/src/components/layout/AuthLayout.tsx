import { Outlet, Navigate } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { useUserStore } from "@/stores/useUserStore"

export function AuthLayout() {
  const { user } = useUserStore()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <header className="flex h-16 items-center justify-end px-6 absolute top-0 right-0 w-full">
        <Header />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  )
}
