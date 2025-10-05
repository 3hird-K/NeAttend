"use client"

import { useQuery } from "@tanstack/react-query"
import { getViews } from "@/lib/supabase/views"

export function ViewsList() {
  const { data: views, isLoading, error } = useQuery({
    queryKey: ["views"],
    queryFn: getViews,
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
