import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const barangayId = (session?.user as { barangayId?: string })?.barangayId
  const barangay = barangayId ? await prisma.barangay.findUnique({ where: { id: barangayId } }) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage barangay information and preferences</p>
      </div>
      <SettingsForm barangay={barangay} />
    </div>
  )
}
