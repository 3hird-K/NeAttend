
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
import { IconEdit, IconTrash, IconCheck } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

export default function AllAnnouncementsTab({
  announcements = [],
  user,
  deleteMutation,
  editMutation,
  readMutation,
  editingAnnouncement,
  setEditingAnnouncement,
  isLoading
}: any) {
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (editingAnnouncement) {
      setEditName(editingAnnouncement.name)
      setEditDescription(editingAnnouncement.description)
      setIsEditDialogOpen(true)
    }
  }, [editingAnnouncement])

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnnouncement) return
    editMutation.mutate({
      id: editingAnnouncement.id,
      name: editName,
      description: editDescription,
    })
    setIsEditDialogOpen(false)
    setEditingAnnouncement(null)
  }

  const handleDeleteConfirm = () => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete)
      setAnnouncementToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const TruncatedText = ({ text, maxLength = 500 }: { text: string | null; maxLength?: number }) => {
    const [expanded, setExpanded] = useState(false)
    if (!text) return null
    if (text?.length <= maxLength) return <span>{text}</span>
    return (
      <span>
        {expanded ? text : text?.slice(0, maxLength) + "..."}{" "}
        <Button
          variant={"link"}
          size={"sm"}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See less" : "See more"}
        </Button>
      </span>
    )
  }

  const renderSkeletonCard = () => (
    <Card className="px-4 animate-pulse">
      <CardHeader className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </CardFooter>
    </Card>
  )

    if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>{renderSkeletonCard()}</div>
        ))}
      </div>
    )
  }


  if (!announcements || announcements.length === 0)
    return <p className="text-gray-500 text-center">No announcements here.</p>

  return (
    <>
      {announcements.map((a: any) => {
        const isOwner = a.user_id === user?.id

        const userReadRecord = Array.isArray(a.announcement_reads)
          ? a.announcement_reads.find((r: any) => r.user_id === user?.id)
          : null
        const hasRead = userReadRecord?.read === true

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
            </CardHeader>

            <CardContent>
              <CardTitle className="mb-2">{a.name}</CardTitle>
              <TruncatedText text={a.description} />
              {/* <CardDescription>{a.description}</CardDescription> */}
            </CardContent>

            <CardFooter className="flex justify-start space-x-4 text-gray-600">
              {isOwner ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      setAnnouncementToDelete(a.id)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <IconTrash className="w-4 h-4 mr-1" /> Trash
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500"
                    onClick={() =>
                      setEditingAnnouncement({
                        id: a.id,
                        name: a.name ?? "",
                        description: a.description ?? "",
                      })
                    }
                  >
                    <IconEdit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={hasRead ? "text-green-600" : "text-gray-600"}
                  onClick={() => readMutation.mutate(a.id)}
                >
                  <IconCheck className="w-4 h-4 mr-1" />
                  {hasRead ? "Read" : "Mark as Read"}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-3 py-2">
              <Input
                placeholder="Announcement title"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <Textarea
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
