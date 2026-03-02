import { HouseholdsTable } from "@/components/households/households-table"

export default function HouseholdsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Households</h1>
        <p className="text-gray-500">Manage household records and family members</p>
      </div>
      <HouseholdsTable />
    </div>
  )
}
