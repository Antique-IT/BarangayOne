import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function PublicVerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string }>
}) {
  const params = await searchParams
  const code = params?.code?.trim()

  const clearance = code
    ? await prisma.clearanceRequest.findFirst({
        where: {
          OR: [{ verificationCode: code }, { documentNumber: code }],
        },
      })
    : null

  const resident = clearance
    ? await prisma.resident.findUnique({
        where: { id: clearance.residentId },
      })
    : null

  const isValid =
    !!clearance &&
    clearance.status === "APPROVED" &&
    (!clearance.expiresAt || clearance.expiresAt >= new Date())

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
        <p className="text-gray-500">Verify the authenticity of barangay-issued documents.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Verify Code</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input id="code" name="code" placeholder="e.g. VRF-2026-XXXX-YYYYYYYYYYYY" defaultValue={code ?? ""} required />
            </div>
            <Button type="submit">Verify</Button>
          </form>
        </CardContent>
      </Card>

      {code ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Verification Result
              {isValid ? <Badge className="bg-green-600">Valid Document</Badge> : <Badge variant="destructive">Invalid Code</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {clearance ? (
              <>
                <p><span className="font-medium text-gray-700">Document Owner:</span> {resident ? `${resident.firstName} ${resident.lastName}` : "Unknown"}</p>
                <p><span className="font-medium text-gray-700">Verification Code:</span> {clearance.verificationCode ?? "Unavailable"}</p>
                <p><span className="font-medium text-gray-700">Date Issued:</span> {clearance.approvedAt ? new Date(clearance.approvedAt).toLocaleDateString() : "Not yet issued"}</p>
                <p><span className="font-medium text-gray-700">Validity:</span> {clearance.expiresAt ? new Date(clearance.expiresAt).toLocaleDateString() : "No expiry"}</p>
              </>
            ) : (
              <p className="text-gray-500">No document found for this verification code.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
