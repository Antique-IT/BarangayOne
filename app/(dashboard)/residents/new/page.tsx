import { ResidentForm } from "@/components/residents/resident-form"

export default function NewResidentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Resident</h1>
        <p className="text-gray-500">Register a new resident in the barangay</p>
      </div>
      <ResidentForm />
    </div>
  )
}
