"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Resident } from "@/types"

interface ResidentFormProps {
  resident?: Partial<Resident>
  isEdit?: boolean
}

export function ResidentForm({ resident, isEdit }: ResidentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [gender, setGender] = useState(resident?.gender || "")
  const [civilStatus, setCivilStatus] = useState(resident?.civilStatus || "")

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: resident?.firstName || "",
      middleName: resident?.middleName || "",
      lastName: resident?.lastName || "",
      suffix: resident?.suffix || "",
      birthDate: resident?.birthDate ? new Date(resident.birthDate).toISOString().split("T")[0] : "",
      address: resident?.address || "",
      purok: resident?.purok || "",
      phone: resident?.phone || "",
      email: resident?.email || "",
      occupation: resident?.occupation || "",
    },
  })

  async function onSubmit(data: Record<string, string>) {
    setLoading(true)
    try {
      const payload = { ...data, gender, civilStatus, isVoter: false }
      const url = isEdit ? `/api/residents/${resident?.id}` : "/api/residents"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error("Failed to save")
      toast({ title: "Success", description: isEdit ? "Resident updated" : "Resident created" })
      router.push("/residents")
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to save resident", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input {...register("firstName", { required: true })} placeholder="Juan" />
                {errors.firstName && <p className="text-xs text-red-500">Required</p>}
              </div>
              <div className="space-y-2">
                <Label>Middle Name</Label>
                <Input {...register("middleName")} placeholder="Dela" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input {...register("lastName", { required: true })} placeholder="Cruz" />
                {errors.lastName && <p className="text-xs text-red-500">Required</p>}
              </div>
              <div className="space-y-2">
                <Label>Suffix</Label>
                <Input {...register("suffix")} placeholder="Jr., Sr., III" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Birth Date *</Label>
              <Input type="date" {...register("birthDate", { required: true })} />
              {errors.birthDate && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Civil Status *</Label>
                <Select value={civilStatus} onValueChange={setCivilStatus}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="MARRIED">Married</SelectItem>
                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                    <SelectItem value="SEPARATED">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input {...register("occupation")} placeholder="Farmer, Teacher, etc." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact & Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input {...register("address", { required: true })} placeholder="123 Rizal St" />
              {errors.address && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Purok</Label>
              <Input {...register("purok")} placeholder="Purok 1" />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input {...register("phone")} placeholder="09XX-XXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="juan@example.com" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Resident" : "Create Resident"}
        </Button>
      </div>
    </form>
  )
}
