"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllUserDepartments } from "@/lib/supabase/user_departments"

export function UserDepartmentsList() {
  const { data: views, isLoading, error } = useQuery({
    queryKey: ["user_departments"],
    queryFn: getAllUserDepartments,
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
