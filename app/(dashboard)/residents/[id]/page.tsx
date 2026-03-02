import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ResidentForm } from "@/components/residents/resident-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Resident } from "@/types"

export default async function ResidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resident = await prisma.resident.findUnique({
    where: { id },
    include: { clearanceRequests: { take: 5, orderBy: { createdAt: "desc" } } },
  })

  if (!resident) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/residents">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{resident.firstName} {resident.lastName}</h1>
          <p className="text-gray-500">Resident Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium">{resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}</p></div>
            <div><p className="text-xs text-gray-500">Birth Date</p><p className="font-medium">{format(new Date(resident.birthDate), "MMMM d, yyyy")}</p></div>
            <div><p className="text-xs text-gray-500">Gender</p><p className="font-medium">{resident.gender}</p></div>
            <div><p className="text-xs text-gray-500">Civil Status</p><p className="font-medium">{resident.civilStatus}</p></div>
            <div><p className="text-xs text-gray-500">Voter Status</p>
              <Badge className={resident.isVoter ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                {resident.isVoter ? "Registered Voter" : "Non-voter"}
              </Badge>
            </div>
            <div><p className="text-xs text-gray-500">Registered</p><p className="font-medium">{format(new Date(resident.createdAt), "MMM d, yyyy")}</p></div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <ResidentForm resident={resident as Partial<Resident>} isEdit />

          {resident.clearanceRequests.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Clearance Requests</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resident.clearanceRequests.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{c.type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-500">{c.documentNumber}</p>
                      </div>
                      <Badge className={
                        c.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : c.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : c.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }>
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
