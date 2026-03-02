import { ClearanceForm } from "@/components/clearances/clearance-form"

export default function NewClearancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Clearance Request</h1>
        <p className="text-gray-500">Submit a new barangay document request</p>
      </div>
      <ClearanceForm />
    </div>
  )
}
