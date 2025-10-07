import { createClient } from "./client"
import { Database } from "@/database.types"


export type Rule = Database["public"]["Tables"]["rules"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]


export type RuleWithUser = Rule & { user: User }
export type AnnouncementWithUser = Announcements & { announcement_reads: AnnouncementReads, user: User }
export type AnnouncementReadWithUser = AnnouncementReads & { user: User }

export type Announcements = Database["public"]["Tables"]["announcements"]["Row"]
export type AnnouncementReads = Database["public"]["Tables"]["announcement_reads"]["Row"]
export type AnnouncementReadWithUsers = Announcements & { user: User, read: AnnouncementReads  }

export async function getAllAnnouncementsWithRead({
   user_id,
}: {
  user_id: string | undefined
}): Promise<AnnouncementReadWithUsers[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      read:announcement_reads(*),
      user:users(*)
    `)
    .eq("read.user_id", user_id)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}


// UNREAD ANNOUNCEMENTS

export async function UnreadAnnouncements({
  user_id,
}: {
  user_id: string | undefined
}): Promise<(Announcements & { read: boolean; user?: User })[]> {
  if (!user_id) return []

  const supabase = createClient()

  // 🧠 Fetch announcements + their read state for this user
  const { data, error } = await supabase
    .from("announcements")
    .select(
      `
      *,
      user:users(*),
      announcement_reads!left (
        read,
        user_id
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (
    data
      .filter((a: any) => a.user_id !== user_id)
      .map((a: any) => {
        const userRead = a.announcement_reads?.find((r: any) => r.user_id === user_id)
        return {
          ...a,
          read: userRead ? userRead.read : false, // default false if not found
        }
      })
      .filter((a: any) => !a.read)
  )
}

// MY ANNOUNCEMENTS
export async function getMyAnnouncements({
  user_id,
}: {
  user_id: string | undefined
}): Promise<AnnouncementReadWithUsers[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      read:announcement_reads(user_id, read),
      user:users(*)
    `)
    .eq("user_id", user_id) 
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return data ?? []
}

// READ ANNOUNCEMENTS
export async function getUnreadAnnouncements({
  user_id,
}: {
  user_id: string | undefined
}): Promise<(Announcements & { read: AnnouncementReads[]; user?: User })[]> {
  if (!user_id) throw new Error("User ID is required")

  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      read:announcement_reads(*),
      user:users(*)
    `)
    .eq("read.user_id", user_id)
    .eq("read.read", true)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  const filtered = (data ?? []).filter(
    (item) =>
      Array.isArray(item.read) &&
      item.read.some((r: any) => r.user_id === user_id && r.read === true)
  )

  return filtered.map((item) => ({
    ...item,
    read: item.read, 
  }))
}


//  REMOVE ANNOUNCEMENT READ (mark as unread)
export async function removeAnnouncementRead(announcementId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("announcement_reads")
    .delete()
    .eq("announcement_id", announcementId)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)

  return { success: true }
}



















// export async function getUnreadAnnouncements({
//   user_id,
// }: {
//   user_id: string | undefined
// }): Promise<(Announcements & { read: boolean; user?: User })[]> {
//   const supabase = createClient()

//   const { data, error } = await supabase
//     .from("announcements")
//     .select(`
//       *,
//       read:announcement_reads(user_id, read),
//       user:users(*)
//     `)
//     .eq("read.user_id", user_id)
//     .eq("read.read", false)
//     .order("created_at", { ascending: false })

//   if (error) throw new Error(error.message)

//   // ✅ Filter out empty read arrays
//   const filtered = (data ?? []).filter(
//     (item) => Array.isArray(item.read) && item.read.length > 0
//   )

//   // ✅ Map to simplified structure (read: boolean)
//   const transformed = filtered.map((item) => ({
//     ...item,
//     read: item.read.some((r: any) => r.read === false),
//   }))

//   return transformed
// }








// GET ALL ANNOUNCEMENTS

export async function getAllAnnouncementsWithReads({
  user_id,
}: {
  user_id: string | undefined
}): Promise<AnnouncementReadWithUsers[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      read:announcement_reads(*),
      user:users(*)
    `)
    .eq("read.user_id", user_id)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// UPDATE ANNOUNCEMENT BY ID

export async function updateAnnouncementById(
    id: string,
    updates: { name?: string | null; description?: string | null}
  ): Promise<AnnouncementWithUser> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return data
  }

// DELETE ANNOUNCEMENT BY ID

export async function deleteAnnouncementById(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}


// UPSERT ANNOUNCEMENT READ

export async function toggleAnnouncementRead(announcementId: string, userId: string) {
  const supabase = createClient()

  // Check if user already has a record for this announcement
  const { data: existing, error: fetchError } = await supabase
    .from("announcement_reads")
    .select("id, read")
    .eq("announcement_id", announcementId)
    .eq("user_id", userId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw new Error(fetchError.message)
  }

  if (!existing) {
    // No record yet → insert as read
    const { error: insertError } = await supabase
      .from("announcement_reads")
      .insert([{ announcement_id: announcementId, user_id: userId, read: true }])

    if (insertError) throw new Error(insertError.message)

    return { status: "inserted", read: true }
  } else {
    // Toggle read value
    const newReadState = !existing.read

    const { error: updateError } = await supabase
      .from("announcement_reads")
      .update({ read: newReadState })
      .eq("id", existing.id)

    if (updateError) throw new Error(updateError.message)

    return { status: "updated", read: newReadState }
  }
}


// export async function toggleAnnouncementRead({
//   user_id,
//   announcement_id,
// }: {
//   user_id: string | undefined
//   announcement_id: string
// }) {
//   if (!user_id) throw new Error("User ID is required")

//   const supabase = createClient()

//   // Check if user already has a record for this announcement
//   const { data: existing, error: fetchError } = await supabase
//     .from("announcement_reads")
//     .select("id, read")
//     .eq("user_id", user_id)
//     .eq("announcement_id", announcement_id)
//     .maybeSingle()

//   if (fetchError) throw new Error(fetchError.message)

//   if (existing) {
//     // ✅ If it exists, toggle the current value
//     const newReadValue = !existing.read

//     const { error: updateError } = await supabase
//       .from("announcement_reads")
//       .update({ read: newReadValue })
//       .eq("id", existing.id)

//     if (updateError) throw new Error(updateError.message)

//     return { read: newReadValue }
//   } else {
//     // ✅ If no record, insert as read = true
//     const { error: insertError } = await supabase
//       .from("announcement_reads")
//       .insert({
//         user_id,
//         announcement_id,
//         read: true,
//       })

//     if (insertError) throw new Error(insertError.message)

//     return { read: true }
//   }
// }












// Get All Announcements with Users
export async function getAllAnnouncementsWithUser(): Promise<AnnouncementWithUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("announcements")
    .select("*, user:users(*)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}




export async function getAllRulesWithUser(): Promise<RuleWithUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("rules")
    .select("*, user:users(*)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}


// Get All Rules
export async function getAllRules(): Promise<Rule[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("rules")
    .select("*, user:users(id, name)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// Get all announcements read by a specific user
export async function getAllAnnouncementWithRead(user_id: string): Promise<AnnouncementWithUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      user:users(*),
      announcement_reads!inner(user_id)
    `)
    .eq("announcement_reads.user_id", user_id) // filter announcement_reads for this user
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}


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

// Create a new Rule
export async function createRule({
  user_id,
  name,
  description,
}: {
  user_id: string
  name: string
  description: string
}): Promise<Rule> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("rules")
    .insert([
      {
        user_id,
        name,
        description,
    },
    ])
    .select()
    .single() 

  if (error) throw new Error(error.message)
  return data
}

// Create a new Announcement
export async function createAnnouncement({
  user_id,
  name,
  description,
}: {
  user_id: string
  name: string
  description: string
}): Promise<Rule> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("announcements")
    .insert([
      {
        user_id,
        name,
        description
      },
    ])
    .select()
    .single() 

  if (error) throw new Error(error.message)
  return data
}






export type AnnouncementAllFalse =  AnnouncementReads

// Get Announcement by announcement_reads --- false
export async function getAnnouncementFalse(userId: string): Promise<AnnouncementAllFalse[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcement_reads")
    .select("*")
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw new Error(error.message);
  return data || [];
}



// // Create or Update announcement_reads
// export async function upsertAnnouncementRead({
//   user_id,
//   announcement_id,
//   read,
// }: {
//   user_id: string
//   announcement_id: string
//   read: boolean
// }): Promise<AnnouncementReadWithUser> {
//   const supabase = createClient()

//   const { data, error } = await supabase
//     .from("announcements")
//     .upsert(
//       [{ announcement_id, user_id, read }], 
//     )
//     .select("*")
//     .single() // return only one row

//   if (error) throw new Error(error.message)
//   return data
// }


// Read annoucementread by userId
export async function getAnnouncementReadsByUser(user_id: string): Promise<AnnouncementReadWithUser[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcement_reads")
    .select("*")
    .eq("user_id", user_id) // filter by user_id

  if (error) throw new Error(error.message)
  return data ?? []
}




