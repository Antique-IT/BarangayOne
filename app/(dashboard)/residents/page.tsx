import { ResidentsTable } from "@/components/residents/residents-table"

export default function ResidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Residents</h1>
        <p className="text-gray-500">Manage registered residents of the barangay</p>
      </div>
      <ResidentsTable />
    </div>
  )
}
