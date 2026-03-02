import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default async function ResidentProfilePage() {
  const session = await getServerSession(authOptions)
  const residentId = session?.user?.residentId
  const barangayId = session?.user?.barangayId

  const resident = residentId && barangayId
    ? await prisma.resident.findFirst({
        where: { id: residentId, barangayId },
        include: {
          householdMembers: {
            include: {
              household: true,
            },
          },
        },
      })
    : null

  async function updateProfile(formData: FormData) {
    "use server"

    const session = await getServerSession(authOptions)
    const residentId = session?.user?.residentId
    const barangayId = session?.user?.barangayId

    if (!residentId || !barangayId) return

    const phone = (formData.get("phone") as string | null)?.trim() || null
    const email = (formData.get("email") as string | null)?.trim() || null
    const address = (formData.get("address") as string | null)?.trim()
    const photo = (formData.get("photo") as string | null)?.trim() || null

    if (!address) return

    const owner = await prisma.resident.findFirst({
      where: { id: residentId, barangayId },
      select: { id: true },
    })

    if (!owner) return

    await prisma.resident.update({
      where: { id: owner.id },
      data: {
        phone,
        email,
        address,
        photo,
      },
    })

    revalidatePath("/resident/profile")
  }

  if (!resident) {
    return (
      <Card>
        <CardHeader><CardTitle>Profile unavailable</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Your account is not linked to a resident profile yet. Please contact barangay staff.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">View and update your resident information.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium">{resident.firstName} {resident.lastName}</p></div>
          <div><p className="text-xs text-gray-500">Civil Status</p><p className="text-sm font-medium">{resident.civilStatus}</p></div>
          <div><p className="text-xs text-gray-500">Gender</p><p className="text-sm font-medium">{resident.gender}</p></div>
          <div><p className="text-xs text-gray-500">Birth Date</p><p className="text-sm font-medium">{new Date(resident.birthDate).toLocaleDateString()}</p></div>
          <div><p className="text-xs text-gray-500">Household Membership</p><p className="text-sm font-medium">{resident.householdMembers?.[0]?.household?.address ?? "Unassigned"}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact & Address</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input id="phone" name="phone" defaultValue={resident.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={resident.email ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={resident.address} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="photo">ID Photo URL</Label>
              <Input id="photo" name="photo" defaultValue={resident.photo ?? ""} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Update Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
