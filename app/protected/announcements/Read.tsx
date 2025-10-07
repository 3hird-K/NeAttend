"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { IconX } from "@tabler/icons-react"
import { useRemoveReadMutation } from "@/hooks/remove-read"

export default function ReadAnnouncementsTab({
  announcement = [],
  user,
}: any) {

  const removeReadMutation = useRemoveReadMutation(user?.id)

  

  if (!announcement || announcement.length === 0)
    return <p className="text-gray-500 text-center">You haven’t read any announcements yet.</p>

  return (
    <>
      {announcement.map((a: any) => {
        // const isOwner = a.user_id === user?.id
        // const userReadRecord = Array.isArray(a.read)
        //   ? a.read.find((r: any) => r.user_id === user?.id)
        //   : null
        // const hasRead = !!userReadRecord

        return (
          <Card key={a.id} className="hover:shadow-lg transition-shadow px-4 mb-5">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarFallback>
                    {a.user?.firstname?.[0] || "U"}
                    {a.user?.lastname?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {a.user?.firstname} {a.user?.lastname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 relative top-0 right-0"
                  onClick={() => removeReadMutation.mutate(a.id)}
                >
                  <IconX className="w-32 h-3 mr-0" />
                  {/* Remove */}
                </Button>
            </CardHeader>

            <CardContent>
              <CardTitle className="mb-2">{a.name}</CardTitle>
              <CardDescription>{a.description}</CardDescription>
            </CardContent>
          </Card>
        )
      })}

    </>
  )
}
