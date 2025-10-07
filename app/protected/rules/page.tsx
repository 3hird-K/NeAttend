"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Database } from "@/database.types"
import { getAllAnnouncementsWithUser, getAllRulesWithUser } from "@/lib/supabase/posts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeSwitcher } from "@/components/theme-switcher"

type User = Database["public"]["Tables"]["users"]["Row"]

export default function AnnouncementPage() {
  const { data: rules, isLoading: rulesLoading, error: rulesError } = useQuery({
    queryKey: ["rules"],
    queryFn: getAllRulesWithUser,
  })

  const TruncatedText = ({ text, maxLength = 150 }: { text: string | null; maxLength?: number }) => {
    const [expanded, setExpanded] = useState(false)
    if (!text) return null
    if (text?.length <= maxLength) return <span>{text}</span>
    return (
      <span>
        {expanded ? text : text?.slice(0, maxLength) + "..."}{" "}
        <Button
          variant={"link"}
          size={"sm"}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See less" : "See more"}
        </Button>
      </span>
    )
  }

  const renderSkeletonCard = () => (
    <Card className="px-4 animate-pulse">
      <CardHeader className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </CardFooter>
    </Card>
  )

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Rules Section */}
        <div className="p-4 border-b flex items-center justify-between mb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance text-center flex-1">
             Rules Posts
          </h1>
          <div className="mb-2 flex-shrink-0">
            <ThemeSwitcher />
          </div>
        </div>
      <section>
        {/* <h2 className="text-2xl font-bold mb-4">Rules</h2> */}
        {rulesLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i}>{renderSkeletonCard()}</div>
              ))}
          </div>
        ) : rulesError ? (
          <p className="text-red-500">Error loading rules: {(rulesError as Error).message}</p>
        ) : rules?.length === 0 ? (
          <p>No rules available.</p>
        ) : (
          <div className="space-y-4">
            {rules?.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow px-4">
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarFallback>
                        {rule.user?.firstname?.charAt(0) || "U"}
                        {rule.user?.lastname?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {rule.user?.firstname} {rule.user?.lastname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(rule.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardTitle className="mb-2">{rule.name}</CardTitle>
                  <CardDescription>
                    <TruncatedText text={rule.description} />
                  </CardDescription>
                </CardContent>

                <CardFooter className="flex justify-start space-x-4 text-gray-600">
                  <Button variant="ghost" size="sm" className="text-red-500">
                    <IconTrash className="w-4 h-4 mr-1" />
                    Trash
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-500">
                    <IconEdit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
