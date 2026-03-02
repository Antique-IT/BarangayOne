import { ClearancesTable } from "@/components/clearances/clearances-table"

export default function ClearancesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clearance Requests</h1>
        <p className="text-gray-500">Manage barangay clearance and certificate requests</p>
      </div>
      <ClearancesTable />
    </div>
  )
}
