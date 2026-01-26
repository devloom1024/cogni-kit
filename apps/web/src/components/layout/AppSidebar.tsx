"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Home,
  PieChart,
  Star,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { NavMain } from "@/components/layout/NavMain"
import { NavUser } from "@/components/layout/NavUser"
import { TeamSwitcher } from "@/components/layout/TeamSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUserStore } from "@/stores/useUserStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { user } = useUserStore()
  const location = useLocation()

  // Sample teams data (kept static for now as per previous request)
  const teams = [
    {
      name: "CogniKit",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ]

  const navMain = [
    {
      title: t('sidebar.investment.title'),
      url: "#",
      icon: PieChart,
      isActive: false,
      items: [
        {
          title: t('sidebar.investment.watchlist'),
          url: "/watchlist",
          icon: Star,
          isActive: location.pathname === '/watchlist',
        },
      ],
    },
  ]

  const userData = {
    name: user?.nickname || user?.username || "Guest",
    email: user?.email || "",
    avatar: user?.avatar || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'} tooltip={t('sidebar.home')}>
                <a href="/">
                  <Home />
                  <span>{t('sidebar.home')}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
