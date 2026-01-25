import { Outlet, Link, Navigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header } from "@/components/layout/Header"
import { useUserStore } from "@/stores/useUserStore"

export function AppLayout() {
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
          <Header />
        </header>
        <main className="container mx-auto py-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
