"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
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
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUserStore } from "@/stores/useUserStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { user } = useUserStore()

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
      isActive: true,
      items: [
        {
          title: t('sidebar.investment.watchlist'),
          url: "/watchlist",
          icon: Star,
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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
