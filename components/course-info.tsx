"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserCourse } from "@/lib/supabase/users"
import { Database } from "@/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

type CourseId = Database["public"]["Tables"]["users"]["Row"]["course_id"]

export function CourseInfo({ course_id }: { course_id: CourseId }) {
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["userCourse", course_id],
    queryFn: () => getUserCourse(course_id),
    enabled: !!course_id,
  })

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading Course...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-1">
            {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!course || course.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Course Found</CardTitle>
        </CardHeader>
        <CardContent className="mt-[-1rem]">
          <p className="text-muted-foreground">This user is not enrolled in any course.</p>
        </CardContent>
      </Card>
    )
  }

  const c = course[0] 

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Course Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-[-1rem]">
        <div>
          <Label className="text-muted-foreground mb-1">Course Name</Label>
          <p className="font-medium">{c.name}</p>
        </div>
        <div>
          <Label className="text-muted-foreground mb-1">Course ID</Label>
          <p className="font-medium">{c.id}</p>
        </div>
      </CardContent>
    </Card>
  )
}
