import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { blotterService } from "@/services/blotter.service"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const blotterStatusMap: Record<string, string> = {
  OPEN: "Open",
  MEDIATION: "Mediation",
  SETTLED: "Settled",
  REFERRED: "Referred",
  CLOSED: "Closed",
}

const blotterStatusBadgeClasses: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  MEDIATION: "bg-yellow-100 text-yellow-700",
  SETTLED: "bg-green-100 text-green-700",
  REFERRED: "bg-purple-100 text-purple-700",
  CLOSED: "bg-gray-100 text-gray-700",
}

export default async function ResidentBlotterPage() {
  const session = await getServerSession(authOptions)
  const residentId = session?.user?.residentId
  const barangayId = session?.user?.barangayId

  async function fileComplaint(formData: FormData) {
    "use server"

    const session = await getServerSession(authOptions)
    const residentId = session?.user?.residentId
    const barangayId = session?.user?.barangayId

    if (!residentId || !barangayId) return

    const respondentName = (formData.get("respondentName") as string | null)?.trim()
    const incidentDate = (formData.get("incidentDate") as string | null)?.trim()
    const incident = (formData.get("incident") as string | null)?.trim()
    const location = (formData.get("location") as string | null)?.trim()
    const description = (formData.get("description") as string | null)?.trim()

    if (!respondentName || !incidentDate || !incident || !location || !description) return

    await blotterService.create(
      barangayId,
      {
        complainantId: residentId,
        complainantName: session.user.name ?? "Resident",
        respondentName,
        incident,
        incidentDate,
        location,
        description,
      },
      session.user.id,
    )

    revalidatePath("/resident/blotter")
  }

  if (!residentId || !barangayId) {
    return (
      <Card>
        <CardHeader><CardTitle>Blotter unavailable</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Your account is not linked to a resident profile.</p></CardContent>
      </Card>
    )
  }

  const blotters = await prisma.blotter.findMany({
    where: {
      barangayId,
      OR: [{ complainantId: residentId }, { respondentId: residentId }],
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blotter Complaints</h1>
        <p className="text-gray-500">File complaints, monitor case updates, and view mediation schedules.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>File Complaint</CardTitle></CardHeader>
        <CardContent>
          <form action={fileComplaint} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input id="incidentDate" name="incidentDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respondentName">Respondent Name</Label>
              <Input id="respondentName" name="respondentName" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="incident">Incident Type</Label>
              <Input id="incident" name="incident" placeholder="e.g. Property dispute" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Submit Complaint</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My Cases</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {blotters.length === 0 ? (
            <p className="text-sm text-gray-500">No blotter records yet.</p>
          ) : (
            blotters.map((caseItem) => (
              <div key={caseItem.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{caseItem.caseNumber}</p>
                  <Badge className={`${blotterStatusBadgeClasses[caseItem.status] ?? "bg-gray-100 text-gray-700"} border-0`}>
                    {blotterStatusMap[caseItem.status] ?? caseItem.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">Incident: {caseItem.incident}</p>
                <p className="text-xs text-gray-500">Respondent: {caseItem.respondentName}</p>
                {caseItem.mediationSchedule ? (
                  <p className="text-xs text-indigo-600">Mediation: {new Date(caseItem.mediationSchedule).toLocaleString()}</p>
                ) : (
                  <p className="text-xs text-gray-500">Mediation schedule pending</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
