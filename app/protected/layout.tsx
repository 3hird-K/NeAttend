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

  const { data: userFromDB, error: userError } = await supabase
    .from("users")
    .select("id, firstname, lastname, email, role, created_at")
    .eq("id", authUserId)
    .single()

  if (userError || !userFromDB) redirect("/auth/login")

  const user = {
    id: userFromDB.id,
    firstname: userFromDB.firstname,
    lastname: userFromDB.lastname,
    email: userFromDB.email,
    role: userFromDB.role ?? "student",
    created_at: userFromDB.created_at ?? null,
  }

  return (
    <QueryProvider>
      <ProtectedLayout user={user}>{children}</ProtectedLayout>
    </QueryProvider>
  )
}
