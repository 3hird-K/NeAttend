"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
Card,
CardHeader,
CardTitle,
CardContent,
CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconEdit, IconTrash, IconUserPlus } from "@tabler/icons-react"

interface TeamMember {
id: string
name: string
role: string
avatar?: string
email: string
}



const initialTeam: TeamMember[] = [
{
id: "1",
name: "Zailgray Busilac Bacor",
role: "Project Manager",
avatar: "[https://randomuser.me/api/portraits/women/2.jpg](https://randomuser.me/api/portraits/women/2.jpg)",
email: "[samantha@example.com](mailto:samantha@example.com)",
},
{
id: "2",
name: "Sherly Atillo",
role: "Frontend Developer",
avatar: "[https://randomuser.me/api/portraits/men/5.jpg](https://randomuser.me/api/portraits/men/5.jpg)",
email: "[adrian@example.com](mailto:adrian@example.com)",
},
{
id: "3",
name: "John Laurence Barton",
role: "UI/UX Designer",
avatar: "[https://randomuser.me/api/portraits/women/65.jpg](https://randomuser.me/api/portraits/women/65.jpg)",
email: "[hannah@example.com](mailto:hannah@example.com)",
},
{
id: "4",
name: "Jed Snyder Chan",
role: "Backend Engineer",
avatar: "[https://randomuser.me/api/portraits/men/33.jpg](https://randomuser.me/api/portraits/men/33.jpg)",
email: "[marcus@example.com](mailto:marcus@example.com)",
},
{
id: "5",
name: "Angelo Alejo",
role: "Backend Engineer",
avatar: "[https://randomuser.me/api/portraits/men/33.jpg](https://randomuser.me/api/portraits/men/33.jpg)",
email: "[marcus@example.com](mailto:marcus@example.com)",
},
]

export default function TeamPage() {
const [search, setSearch] = useState("")
const filteredTeam = initialTeam.filter((member) =>
member.name.toLowerCase().includes(search.toLowerCase())
)

return ( <div className="space-y-8">
{/* Header */} <div className="flex items-center justify-between"> <div> <h1 className="text-2xl font-semibold tracking-tight">Team Members</h1> <p className="text-sm text-muted-foreground">
Manage your organization’s collaborators and roles. </p> </div> <Button className="gap-2"> <IconUserPlus className="w-4 h-4" />
Add Member </Button> </div>

```
  {/* Search */}
  <div className="max-w-sm">
    <Input
      placeholder="Search members..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* Team Grid */}
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {filteredTeam.map((member) => (
      <motion.div
        key={member.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group hover:shadow-md transition-all duration-300 border-border/50 rounded-2xl">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12">
              {member.avatar ? (
                <AvatarImage src={member.avatar} />
              ) : (
                <AvatarFallback>
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold">
                {member.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {member.role}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <IconEdit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
              >
                <IconTrash className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>

  {filteredTeam.length === 0 && (
    <p className="text-center text-muted-foreground py-8">
      No team members found.
    </p>
  )}
</div>


)
}
