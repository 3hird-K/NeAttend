"use client"

import AllAnnouncementsTab from "./Announce"

export default function MyAnnouncementsTab(props: any) {
  const { announcements = [], user } = props

  const myAnnouncements = announcements.filter((a: any) => a.user_id === user?.id)
  return <AllAnnouncementsTab {...props} announcements={myAnnouncements} />
}
