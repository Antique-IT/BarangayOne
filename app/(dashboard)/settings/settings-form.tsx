"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Barangay {
  id: string
  name: string
  region: string
  city: string
  province: string
  address: string
  contactNumber?: string | null
}

export function SettingsForm({ barangay }: { barangay: Barangay | null }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: barangay?.name || "",
    region: barangay?.region || "",
    address: barangay?.address || "",
    city: barangay?.city || "",
    province: barangay?.province || "",
    contactNumber: barangay?.contactNumber || "",
  })

  function handleChange(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast({ title: "Success", description: "Settings saved (read-only demo)" })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Barangay Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Barangay Name</Label>
              <Input value={form.name} onChange={e => handleChange("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={form.region} onChange={e => handleChange("region", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={e => handleChange("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={e => handleChange("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Province</Label>
              <Input value={form.province} onChange={e => handleChange("province", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input value={form.contactNumber} onChange={e => handleChange("contactNumber", e.target.value)} />
          </div>
          <div className="flex justify-end pt-2">
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">System Information</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b"><span>System Version</span><span className="font-medium">BarangayOS v1.0.0</span></div>
          <div className="flex justify-between py-2 border-b"><span>Database</span><span className="font-medium">PostgreSQL</span></div>
          <div className="flex justify-between py-2"><span>Framework</span><span className="font-medium">Next.js 15</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
