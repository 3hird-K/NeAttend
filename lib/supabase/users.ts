import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Course = Database["public"]["Tables"]["courses"]["Row"]
export type course_id = Database["public"]["Tables"]["users"]["Row"]["course_id"]

// Get All Users
export async function getAllUsers(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// Update User (now includes course_id)
export async function updateUser(
  id: string,
  payload: Partial<Pick<User, "firstname" | "lastname" | "role" | "course_id">>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)

  if (error) throw new Error(error.message)
}

//  Delete User
export async function deleteUser(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}

//  Get a single User's Course by ID
export async function getUserCourse(course_id: string | null): Promise<Course | null> {
  if (!course_id) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", course_id)
    .single() 

  if (error) throw new Error(error.message)
  return data
}


//  Get All Courses (for dropdowns)
export async function getAllCourse(): Promise<Course[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}


//  Get User by ID
export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single() 

  if (error) throw new Error(error.message)
  return data ?? null
}


