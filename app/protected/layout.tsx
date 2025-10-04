import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProtectedLayout from "./protectedLayout"

export default async function ProtectedServerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  if (claimsError || !claimsData?.claims) redirect("/auth/login")

  const claims = claimsData.claims
  const authUserId = claims.sub 

  // console.log("UserId", authUserId)

  const { data: userFromDB, error: userError } = await supabase
    .from("users")
    .select("id, firstname, lastname, email, role")
    .eq("id", authUserId)
    .single() 
  
  // console.log(userFromDB?.id)

  // console.log("Data:", JSON.stringify(userFromDB, null, 2))
  // console.log("Error:", userError)
  if (userError || !userFromDB) redirect("/auth/login") 


  const user = {
    name: `${userFromDB.firstname ?? ""} ${userFromDB.lastname ?? ""}`.trim() || userFromDB.email,
    email: userFromDB.email,
    avatar: "/avatars/default.png",
    role: userFromDB.role ?? "N/A",
  }

  return <ProtectedLayout user={user}>{children}</ProtectedLayout>
}
