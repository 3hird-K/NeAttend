"use client"

import { toggleAnnouncementRead } from "@/lib/supabase/posts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useToggleReadMutation(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (announcementId: string) => {
      if (!userId) throw new Error("User not authenticated")
      return toggleAnnouncementRead(announcementId, userId)
    },

    // Optimistic update
    onMutate: async (announcementId: string) => {
      await queryClient.cancelQueries({ queryKey: ["announcements", userId] })

      const previousData = queryClient.getQueryData<any[]>([
        "announcements",
        userId,
      ])

      queryClient.setQueryData<any[]>(
        ["announcements", userId],
        (old) =>
          old?.map((a) =>
            a.id === announcementId
              ? { ...a, read: { ...a.read, read: !a.read?.read } }
              : a
          ) ?? []
      )

      return { previousData }
    },

    onError: (err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["announcements", userId], context.previousData)
      }
      toast.error("Failed to toggle read state", {
        description: (err as Error).message,
        position: "top-center",
      })
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      toast.success(data.read ? "Marked as read" : "Marked as unread", {
        position: "top-center",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", userId] })
    },
  })
}
