import { BlotterTable } from "@/components/blotter/blotter-table"

export default function BlotterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blotter Cases</h1>
        <p className="text-gray-500">Record and manage incident reports and dispute resolutions</p>
      </div>
      <BlotterTable />
    </div>
  )
}
