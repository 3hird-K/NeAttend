"use client";
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

interface User {
  name: string
  email: string
  avatar: string
  role?: string
}

interface ProtectedLayoutProps {
  children: React.ReactNode
  user: User
}

export function ProtectedLayoutContent({ children, user }: ProtectedLayoutProps) {
  const { open, isMobile } = useSidebar()

  return (
    <div className="flex w-full min-h-screen">
      <div className={`transition-all duration-300 ${isMobile ? `fixed top-0 left-0 z-50 h-screen w-80 bg-background shadow-lg ${open ? "translate-x-0" : "-translate-x-full"}` : `sticky top-0 h-screen border-r bg-background ${open ? "w-64" : "w-20"}`}`}>
        <AppSidebar user={user} /> 
      </div>

      <SidebarInset className={`flex flex-col flex-1 transition-all duration-300 ${!isMobile && open ? "ml-2" : !isMobile ? "ml-2" : "ml-0"}`}>
        <div className="p-4 border-b flex items-center justify-center font-bold">
          User Management
        </div>
        <main className="flex-1 w-full max-w-full mx-auto p-4 sm:p-6 md:p-10 transition-all duration-300">
          {children}
        </main>
      </SidebarInset>
    </div>
  )
}

export default function ProtectedLayout({ children, user }: ProtectedLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <ProtectedLayoutContent user={user}>{children}</ProtectedLayoutContent>
    </SidebarProvider>
  )
}
