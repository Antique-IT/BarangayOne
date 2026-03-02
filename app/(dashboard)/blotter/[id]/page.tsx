import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  MEDIATION: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  ESCALATED: "bg-gray-100 text-gray-700",
}

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  MEDIATION: "Mediation",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
}

export default async function BlotterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blotter = await prisma.blotter.findUnique({
    where: { id },
    include: { complainant: true },
  })

  if (!blotter) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/blotter">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{blotter.caseNumber}</h1>
          <p className="text-gray-500">Blotter Case Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Case Information</CardTitle>
              <Badge className={`${statusColors[blotter.status]} border-0`}>{statusLabels[blotter.status] ?? blotter.status.replaceAll("_", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><p className="text-xs text-gray-500">Incident Type</p><p className="font-medium">{blotter.incident}</p></div>
            <div><p className="text-xs text-gray-500">Incident Date</p><p className="font-medium">{format(new Date(blotter.incidentDate), "MMMM d, yyyy")}</p></div>
            <div><p className="text-xs text-gray-500">Location</p><p className="font-medium">{blotter.location}</p></div>
            <div><p className="text-xs text-gray-500">Date Filed</p><p className="font-medium">{format(new Date(blotter.createdAt), "MMMM d, yyyy")}</p></div>
            {blotter.mediationSchedule && <div><p className="text-xs text-gray-500">Mediation Schedule</p><p className="font-medium">{format(new Date(blotter.mediationSchedule), "MMMM d, yyyy")}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Parties Involved</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-500 font-medium">COMPLAINANT</p>
              <p className="font-medium">{blotter.complainantName}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-500 font-medium">RESPONDENT</p>
              <p className="font-medium">{blotter.respondentName}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{blotter.description}</p>
            {blotter.resolution && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">RESOLUTION</p>
                <p className="text-sm">{blotter.resolution}</p>
              </div>
            )}
            {blotter.resolutionNotes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">RESOLUTION NOTES</p>
                <p className="text-sm">{blotter.resolutionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
