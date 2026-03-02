import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  RELEASED: "bg-blue-100 text-blue-700",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  PAYMENT_PENDING: "Payment Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RELEASED: "Released",
}

export default async function ClearanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clearance = await prisma.clearanceRequest.findUnique({
    where: { id },
    include: { resident: true },
  })

  if (!clearance) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clearances">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{clearance.documentNumber}</h1>
          <p className="text-gray-500">Clearance Request Details</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Request Information</CardTitle>
            <Badge className={`${statusColors[clearance.status]} border-0`}>{statusLabels[clearance.status] ?? clearance.status.replaceAll("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Document Number</p><p className="font-mono font-medium">{clearance.documentNumber}</p></div>
            <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{clearance.type.replace(/_/g, " ")}</p></div>
            <div><p className="text-xs text-gray-500">Resident</p><p className="font-medium">{clearance.resident?.firstName} {clearance.resident?.lastName}</p></div>
            <div><p className="text-xs text-gray-500">Purpose</p><p className="font-medium">{clearance.purpose || "-"}</p></div>
            {clearance.approvedAt && <div><p className="text-xs text-gray-500">Approved At</p><p className="font-medium">{format(new Date(clearance.approvedAt), "MMM d, yyyy")}</p></div>}
            {clearance.expiresAt && <div><p className="text-xs text-gray-500">Expires At</p><p className="font-medium">{format(new Date(clearance.expiresAt), "MMM d, yyyy")}</p></div>}
            <div><p className="text-xs text-gray-500">Date Requested</p><p className="font-medium">{format(new Date(clearance.createdAt), "MMM d, yyyy")}</p></div>
          </div>
          {clearance.remarks && (
            <div><p className="text-xs text-gray-500">Remarks</p><p className="text-sm">{clearance.remarks}</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
