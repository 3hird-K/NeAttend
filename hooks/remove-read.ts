"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { removeAnnouncementRead } from "@/lib/supabase/posts"

export function useRemoveReadMutation(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (announcementId: string) => {
      if (!userId) throw new Error("User not authenticated")
      return removeAnnouncementRead(announcementId, userId)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", "read", userId] })
      queryClient.invalidateQueries({ queryKey: ["announcements", "unread", userId] })
      toast.success("Removed from read list", { position: "top-center" })
    },

    onError: (err) => {
      toast.error("Failed to remove from read list", {
        description: (err as Error).message,
        position: "top-center",
      })
    },
  })
}
