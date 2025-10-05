"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Database } from "@/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

interface NavUserProps {
  user: User
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter()
  const { open, isMobile } = useSidebar()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Fallback avatar (default image if not in DB)
  const avatarUrl = (user as any).avatar || "/avatars/default.png"

  // Map roles to display names
  const roleDisplayMap: Record<string, string> = {
    admin: "Administrator",
    instructor: "Instructor",
    student: "Student",
    adins: "Admin/Instructor",
  }

  const displayRole = user.role ? roleDisplayMap[user.role] || user.role : "N/A"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={avatarUrl} alt={user.firstname || "User"} />
                <AvatarFallback className="rounded-sm text-sm">
                  {user.firstname?.charAt(0) || "U"}
                  {user.lastname?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>

              {open && (
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-medium">
                    {user.firstname} {user.lastname}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {displayRole}
                  </span>
                </div>
              )}

              {open && <IconDotsVertical className="ml-auto size-4" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={user.firstname || "User"} />
                  <AvatarFallback className="rounded-lg">
                    {user.firstname?.charAt(0) || "U"}
                    {user.lastname?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.firstname} {user.lastname}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
