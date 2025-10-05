import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]

// ✅ Get all users
export async function getAllUsers(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateUser(
  id: string,
  payload: Partial<Pick<User, "firstname" | "lastname" | "role">>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}
