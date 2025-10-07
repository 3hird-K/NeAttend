import { createClient } from "./client"
import { Database } from "@/database.types"

export type Announcements = Database["public"]["Tables"]["announcements"]["Row"]

// Get All Announcements
export async function getAllAnnouncements(): Promise<Announcements[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// Fetch announcements with user's read status
export async function getAllAnnouncementsWithUserAndRead(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      announcement_reads(read, user_id),
      users(*)
    `)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  // Map read status for the current user
  return (data ?? []).map(a => ({
    ...a,
    read: a.announcement_reads?.some((r: any) => r.user_id === userId && r.read) ?? false,
  }))
}

// Toggle read/unread
export async function toggleAnnouncementRead(
  announcementId: string,
  userId: string,
  read: boolean
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcement_reads")
    .upsert(
      [
        { announcement_id: announcementId, user_id: userId, read }
      ],
      { onConflict: "announcement_id,user_id" }
    )

  if (error) throw new Error(error.message)
  return data
}
