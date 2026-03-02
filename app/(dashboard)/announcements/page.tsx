import { AnnouncementsList } from "@/components/announcements/announcements-list"

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500">Manage community announcements and notices</p>
      </div>
      <AnnouncementsList />
    </div>
  )
}
