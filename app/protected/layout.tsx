import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProtectedLayout from "./protectedLayout"
import { QueryProvider } from "@/provider/query-provider"

export default async function ProtectedServerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  if (claimsError || !claimsData?.claims) redirect("/auth/login")

  const claims = claimsData.claims
  const authUserId = claims.sub 

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUserId)
    .single()

  if (userError || !userData) redirect("/auth/login")

  const user = {
    id: userData.id,
    firstname: userData.firstname ?? null,
    lastname: userData.lastname ?? null,
    email: userData.email,
    role: userData.role ?? null,
    department_id: userData.department_id ?? null,
    course_id: userData.course_id ?? null,
    avatar_url: userData.avatar_url ?? null,
    created_at: userData.created_at ?? null,
    updated_at: userData.updated_at ?? null
  }

  return (
    <QueryProvider>
      <ProtectedLayout user={user}>{children}</ProtectedLayout>
    </QueryProvider>
  )
}
