import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["user_departments"]["Row"]

// ✅ Get all users
export async function getAllUserDepartments(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("user_departments")
    .select("*")

  if (error) throw new Error(error.message)
  return data ?? []
}
