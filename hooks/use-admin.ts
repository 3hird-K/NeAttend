import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]

export async function getAdminUser() {
  const supabase = await createClient()

  // Get current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData?.session?.user) {
    redirect("/auth/login")
  }

  // Fetch user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", sessionData.session.user.id)
    .single()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const claims = sessionData.session.user
  const isAdmin = user.role === "Admin" || user.role === "Admin/Instructor"
  const isInstructor = user.role === "Instructor"
  const isStudent = user.role === "Student"
  return { user, claims, isAdmin, isInstructor, isStudent }
}
