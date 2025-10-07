"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateAnnouncementById,
  deleteAnnouncementById,
  getMyAnnouncements,
  UnreadAnnouncements,
  getUnreadAnnouncements,
  // getReadAnnouncements, // ✅ import the new read function
} from "@/lib/supabase/posts"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from "sonner"
import AllAnnouncementsTab from "./Announce"
import MyAnnouncementsTab from "./Tab"
import ReadAnnouncementsTab from "./Read"
import { useToggleReadMutation } from "@/hooks/toggle-read"
import type { Database } from "@/database.types"

export type AnnouncementReads =
  Database["public"]["Tables"]["announcement_reads"]["Row"]
export type AnnouncementReadWithUsers = Announcements & {
  user?: User
  announcement_reads?: AnnouncementReads[]
}

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Announcements = Database["public"]["Tables"]["announcements"]["Row"]
export type AnnouncementWithRead = Announcements & {
  read: boolean
  user?: User
}

export default function AnnouncementPage() {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const [editingAnnouncement, setEditingAnnouncement] = useState<{
    id: string
    name: string
    description: string
  } | null>(null)

  const user_id = user?.id

  // 📨 UNREAD ANNOUNCEMENTS
  const {
    data: announcements,
    isLoading,
    error,
  } = useQuery<AnnouncementWithRead[]>({
    queryKey: ["announcements", "unread", user_id],
    queryFn: () => UnreadAnnouncements({ user_id }),
    enabled: !!user_id,
  })

  // 👤 MY ANNOUNCEMENTS
  const {
    data: myAnnouncements,
    isLoading: myannounce,
    error: myannounceerror,
  } = useQuery<AnnouncementReadWithUsers[]>({
    queryKey: ["announcements", "mine", user_id],
    queryFn: () => getMyAnnouncements({ user_id }),
    enabled: !!user_id,
  })

  // ✅ READ ANNOUNCEMENTS
  const {
    data: readAnnouncements,
    isLoading: readAnnounce,
    error: readAnnounceError,
  } = useQuery<(Announcements & { read: AnnouncementReads[]; user?: User })[]>({
    queryKey: ["announcements", "read", user_id],
    queryFn: () => getUnreadAnnouncements({ user_id }), 
    enabled: !!user_id,
  })

  // ✅ UPDATE ANNOUNCEMENT
  const editMutation = useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: string
      name: string
      description: string
    }) => updateAnnouncementById(id, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", user_id] })
      setEditingAnnouncement(null)
      toast.success("Announcement updated successfully", {
        description: "Announcement has been updated.",
        position: "top-center",
      })
    },
    onError: (err: any) => {
      toast.error("Announcement update failed", {
        description: `Error: ${err.message}`,
        position: "top-center",
      })
    },
  })

  // ✅ DELETE ANNOUNCEMENT
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncementById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", user_id] })
      toast.success("Announcement deleted successfully", {
        description: "Announcement has been deleted.",
        position: "top-center",
      })
    },
    onError: (err: any) => {
      toast.error("Delete failed", {
        description: `Error: ${err.message}`,
        position: "top-center",
      })
    },
  })

  // ✅ READ/UNREAD TOGGLE
  const readMutation = useToggleReadMutation(user_id)

  if (isLoading || myannounce || readAnnounce) return <Skeleton />
  if (error || myannounceerror || readAnnounceError)
    return <p>Error: {(error as Error).message}</p>

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="p-4 border-b flex items-center justify-between mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-center flex-1">
          Announcements
        </h1>
        <div className="mb-2 flex-shrink-0">
          <ThemeSwitcher />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="mine">My Posts</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        {/* 🔹 All Announcements (Unread) */}
        <TabsContent value="all">
          <AllAnnouncementsTab
            announcements={announcements || []}
            user={user}
            deleteMutation={deleteMutation}
            editMutation={editMutation}
            readMutation={readMutation}
            editingAnnouncement={editingAnnouncement}
            setEditingAnnouncement={setEditingAnnouncement}
          />
        </TabsContent>

        {/* 🔹 My Announcements */}
        <TabsContent value="mine">
          <MyAnnouncementsTab
            announcements={myAnnouncements || []}
            user={user}
            deleteMutation={deleteMutation}
            editMutation={editMutation}
            readMutation={readMutation}
            editingAnnouncement={editingAnnouncement}
            setEditingAnnouncement={setEditingAnnouncement}
          />
        </TabsContent>

        {/* 🔹 Read Announcements */}
        <TabsContent value="read">
          <ReadAnnouncementsTab
            announcement={readAnnouncements}
            user={user}
            deleteMutation={deleteMutation}
            editMutation={editMutation}
            readMutation={readMutation}
            editingAnnouncement={editingAnnouncement}
            setEditingAnnouncement={setEditingAnnouncement}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
