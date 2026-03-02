import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Users, FileText, Shield, Megaphone, Home, UserCheck } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const barangayId = (session?.user as { barangayId?: string })?.barangayId
  const where = { barangayId: barangayId || undefined }

  const [
    totalResidents,
    totalHouseholds,
    pendingClearances,
    activeBlotters,
    publishedAnnouncements,
    voterCount,
  ] = await prisma.$transaction([
    prisma.resident.count({ where: { ...where, isArchived: false } }),
    prisma.household.count({ where }),
    prisma.clearanceRequest.count({ where: { ...where, status: { in: ["PENDING", "UNDER_REVIEW", "PAYMENT_PENDING"] } } }),
    prisma.blotter.count({ where: { ...where, status: { in: ["OPEN", "MEDIATION"] } } }),
    prisma.announcement.count({ where: { ...where, isPublished: true } }),
    prisma.resident.count({ where: { ...where, isVoter: true, isArchived: false } }),
  ])

  const barangay = barangayId ? await prisma.barangay.findUnique({ where: { id: barangayId } }) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening in {barangay?.name || "your barangay"}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Residents" value={totalResidents} description="Registered residents" icon={Users} />
        <StatsCard title="Households" value={totalHouseholds} description="Registered households" icon={Home} />
        <StatsCard title="Registered Voters" value={voterCount} description="Active voters" icon={UserCheck} color="text-green-600" />
        <StatsCard title="Active Clearance Requests" value={pendingClearances} description="Pending, under review, and payment pending" icon={FileText} color="text-yellow-600" />
        <StatsCard title="Active Blotters" value={activeBlotters} description="Under investigation" icon={Shield} color="text-red-600" />
        <StatsCard title="Announcements" value={publishedAnnouncements} description="Published" icon={Megaphone} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
          <h3 className="font-semibold text-indigo-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: "/dashboard/residents/new", label: "Add New Resident", desc: "Register a new resident" },
              { href: "/dashboard/clearances/new", label: "Issue Clearance", desc: "Process clearance request" },
              { href: "/dashboard/blotter/new", label: "File Blotter Case", desc: "Record a new incident" },
              { href: "/dashboard/announcements", label: "Post Announcement", desc: "Publish community notice" },
            ].map(action => (
              <a key={action.href} href={action.href} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 text-xs font-bold">→</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
