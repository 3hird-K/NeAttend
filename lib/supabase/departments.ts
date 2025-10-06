import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["departments"]["Row"]

// ✅ Get all users
export async function getAllDeparments(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("created_at", { ascending: false })

    console.log(data)
  if (error) throw new Error(error.message)
  return data ?? []
}
