"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/data-table"
import { getAllUsers } from "@/lib/supabase/users"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AlertCircleIcon } from "lucide-react"

export default function UsersTableClient() {
  const { data: users = [], isRefetching, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <div className="border rounded-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b p-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error)
    return (
      <div className="grid w-full max-w-xl items-start gap-4">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Error Fetching Users</AlertTitle>
          <AlertDescription>
            <p>Please reload the page, and try again.</p>
          </AlertDescription>
        </Alert>
      </div>
    )

  return (
    <div className="relative">
      {isRefetching && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-muted/70 text-center text-sm p-1">
           Refreshing users...
        </div>
      )}
      <DataTable data={users} />
    </div>
  )
}
