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
import { IconEdit, IconTrash, IconX } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRemoveReadMutation } from "@/hooks/remove-read"

export default function ReadAnnouncementsTab({
  announcement = [],
  user,
  deleteMutation,
  editMutation,
  readMutation,
  editingAnnouncement,
  setEditingAnnouncement,
}: any) {
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)

  const removeReadMutation = useRemoveReadMutation(user?.id)
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

  if (!announcement || announcement.length === 0)
    return <p className="text-gray-500">You haven’t read any announcements yet.</p>

  return (
    <>
      {announcement.map((a: any) => {
        const isOwner = a.user_id === user?.id
        const userReadRecord = Array.isArray(a.read)
          ? a.read.find((r: any) => r.user_id === user?.id)
          : null
        const hasRead = !!userReadRecord

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
              <CardDescription>{a.description}</CardDescription>
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
                  className="text-red-600"
                  onClick={() => removeReadMutation.mutate(a.id)}
                >
                  <IconX className="w-4 h-4 mr-1" />
                  Remove
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
