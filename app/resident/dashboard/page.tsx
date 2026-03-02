import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const requestStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
}

const requestStatusBadgeClasses: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-700",
}

const clearanceTypeLabels: Record<string, string> = {
  BARANGAY_CLEARANCE: "Barangay Clearance",
  RESIDENCY_CERTIFICATE: "Residency Certificate",
  INDIGENCY_CERTIFICATE: "Indigency Certificate",
  BUSINESS_CLEARANCE: "Business Clearance",
  CERTIFICATE_OF_GOOD_MORAL: "Certificate of Good Moral",
}

export default async function ResidentDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.residentId || !session.user.barangayId) {
    redirect("/resident/profile")
  }

  const [resident, pendingRequests, activeCases, announcements] = await Promise.all([
    prisma.resident.findFirst({
      where: {
        id: session.user.residentId,
        barangayId: session.user.barangayId,
      },
    }),
    prisma.clearanceRequest.findMany({
      where: {
        residentId: session.user.residentId,
        barangayId: session.user.barangayId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.blotter.findMany({
      where: {
        barangayId: session.user.barangayId,
        status: { in: ["OPEN", "MEDIATION", "SETTLED", "REFERRED"] as unknown as never },
        OR: [{ complainantId: session.user.residentId }, { respondentId: session.user.residentId }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: {
        barangayId: session.user.barangayId,
        isPublished: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resident Dashboard</h1>
        <p className="text-gray-500">Welcome back, {resident?.firstName ?? session.user.name ?? "Resident"}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Active Clearance Requests</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{pendingRequests.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Blotter Cases</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{activeCases.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Announcements</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{announcements.length}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Active Clearance Requests</CardTitle></CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No active clearance requests.</p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{clearanceTypeLabels[request.type] ?? request.type.replaceAll("_", " ")}</p>
                      <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`${requestStatusBadgeClasses[request.status] ?? "bg-gray-100 text-gray-700"} border-0`}>
                      {requestStatusLabels[request.status] ?? request.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Announcements</CardTitle></CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements available.</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                    <p className="line-clamp-2 text-xs text-gray-500">{announcement.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
