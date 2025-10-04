import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InfoIcon, User, Mail, Shield } from "lucide-react"
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Database, Tables } from "@/database.types"


type User = Database["public"]["Tables"]["users"]["Row"]


export default async function ProtectedPage() {
  const supabase = await createClient()

  // Get authenticated user claims
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect("/auth/login")
  }

  const claims = data.claims

  // Fetch users from the database
  const { data: usersData, error: usersError } = await supabase
    .from<"users", User>("users")
    .select("*")

  if (usersError) {
    console.error(usersError)
  }

  // Ensure users is always an array
  const users: User[] = usersData ?? []

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <DataTable data={users} />

      {/* Info Banner */}
      <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
        <InfoIcon size="16" strokeWidth={2} />
        This is a protected page that you can only see as an authenticated user
      </div>

      {/* User Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your User Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Email:</span> {claims.email}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Role:</span> {claims.role ?? "N/A"}
          </div>

          {/* Debug full claims */}
          <pre className="text-xs font-mono p-3 rounded border max-h-40 overflow-auto bg-muted">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <FetchDataSteps />
        </CardContent>
      </Card>
    </div>
  )
}
