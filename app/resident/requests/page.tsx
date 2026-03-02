import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { clearanceService } from "@/services/clearance.service"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const statusMap: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
}

const statusBadgeClasses: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-700",
}

const documentTypeMap: Record<string, string> = {
  BARANGAY_CLEARANCE: "Barangay Clearance",
  RESIDENCY_CERTIFICATE: "Residency Certificate",
  INDIGENCY_CERTIFICATE: "Indigency Certificate",
  BUSINESS_CLEARANCE: "Business Clearance",
  CERTIFICATE_OF_GOOD_MORAL: "Certificate of Good Moral",
}

export default async function ResidentRequestsPage() {
  const session = await getServerSession(authOptions)
  const residentId = session?.user?.residentId
  const barangayId = session?.user?.barangayId

  async function submitRequest(formData: FormData) {
    "use server"

    const session = await getServerSession(authOptions)
    const residentId = session?.user?.residentId
    const barangayId = session?.user?.barangayId

    if (!residentId || !barangayId) return

    const type = formData.get("type") as "BARANGAY_CLEARANCE" | "RESIDENCY_CERTIFICATE" | "INDIGENCY_CERTIFICATE" | "BUSINESS_CLEARANCE"
    const purpose = (formData.get("purpose") as string | null)?.trim() || null

    await clearanceService.create(barangayId, {
      residentId,
      type,
      purpose,
    }, session.user.id)

    revalidatePath("/resident/requests")
  }

  if (!residentId || !barangayId) {
    return (
      <Card>
        <CardHeader><CardTitle>Requests unavailable</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Your account is not linked to a resident profile.</p></CardContent>
      </Card>
    )
  }

  const requests = await prisma.clearanceRequest.findMany({
    where: { residentId, barangayId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clearance Requests</h1>
        <p className="text-gray-500">Request barangay documents and track status updates.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>New Request</CardTitle></CardHeader>
        <CardContent>
          <form action={submitRequest} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <select id="type" name="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="BARANGAY_CLEARANCE">
                <option value="BARANGAY_CLEARANCE">Barangay Clearance</option>
                <option value="RESIDENCY_CERTIFICATE">Residency Certificate</option>
                <option value="INDIGENCY_CERTIFICATE">Indigency Certificate</option>
                <option value="BUSINESS_CLEARANCE">Business Clearance</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" name="purpose" placeholder="Employment, scholarship, business permit..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Request Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-500">No requests yet.</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{documentTypeMap[request.type] ?? request.type.replaceAll("_", " ")}</p>
                  <p className="text-xs text-gray-500">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Control No: {request.documentNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusBadgeClasses[request.status] ?? "bg-gray-100 text-gray-700"} border-0`}>
                    {statusMap[request.status] ?? request.status.replaceAll("_", " ")}
                  </Badge>
                  {request.status === "APPROVED" ? (
                    <a
                      className="text-xs font-medium text-indigo-600 hover:underline"
                      href={`/api/clearances/${request.id}/document`}
                    >
                      Download Document
                    </a>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
