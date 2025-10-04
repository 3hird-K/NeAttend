"use client"

import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconFolder,
  IconUsers,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconInnerShadowTop,
  IconBrandMeetup,
  IconBrandGmail,
  IconBrandGoogle,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import Logo from "@/assets/dark-logo.png"
import Image from "next/image"


interface User {
  name: string
  email: string
  avatar: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User
}

const navData = {
  navMain: [
    { title: "Dashboard", url: "#", icon: IconDashboard },
    // { title: "Lifecycle", url: "#", icon: IconListDetails },
    { title: "Analytics", url: "#", icon: IconChartBar },
    { title: "Projects", url: "#", icon: IconFolder },
    { title: "Team", url: "#", icon: IconUsers },
  ],
  navSecondary: [
    { title: "Theme", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
  documents: [
    { name: "Data Library", url: "#", icon: IconDatabase },
    { name: "Reports", url: "#", icon: IconReport },
    { name: "Word Assistant", url: "#", icon: IconFileWord },
  ],
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { open, toggleSidebar } = useSidebar()

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      {...props}
      className={`sticky top-0 h-screen border-r bg-background transition-all duration-300 ${props.className ?? ""}`}
    >
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5 relative">
            <a
              href="#"
              className={`relative flex items-center ${
                open ? "justify-between px-2" : "justify-center"
              }`}
            >
              {open && <Image src={Logo} alt="Logo" height={70} width={70} />}

              {/* Sidebar toggle button */}
              <SidebarTrigger className={`${open ? "" : "absolute"} text-5xl`} onClick={toggleSidebar} size="lg" />
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>




      <SidebarContent>
        <NavMain items={navData.navMain} showText={open} />
        <NavDocuments items={navData.documents} showText={open} />
        <NavSecondary items={navData.navSecondary} showText={open} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
