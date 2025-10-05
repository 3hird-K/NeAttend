"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllUsers } from "@/lib/supabase/users"

export function UsersList() {
  const { data: views, isLoading, error } = useQuery({
    queryKey: ["views"],
    queryFn: getAllUsers,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  return (
    <div>
      <h1>Users</h1>
      <pre>{JSON.stringify(views, null, 2)}</pre>
    </div>
  )
}
