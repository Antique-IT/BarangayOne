import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default async function HouseholdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const household = await prisma.household.findUnique({
    where: { id },
    include: { members: { include: { resident: true } } },
  })

  if (!household) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/households">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Household #{household.houseNumber || "N/A"}</h1>
          <p className="text-gray-500">{household.address}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Household Members</CardTitle></CardHeader>
        <CardContent>
          {household.members.length === 0 ? (
            <p className="text-sm text-gray-500">No members assigned</p>
          ) : (
            <div className="space-y-3">
              {household.members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{m.resident.firstName} {m.resident.lastName}</p>
                    <p className="text-xs text-gray-500">{m.relationship} • {m.resident.gender}</p>
                  </div>
                  {m.isHead && <Badge className="bg-indigo-100 text-indigo-700">Head</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
