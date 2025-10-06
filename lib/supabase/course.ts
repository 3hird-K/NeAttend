import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["courses"]["Row"]

export async function getAllCourse(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
