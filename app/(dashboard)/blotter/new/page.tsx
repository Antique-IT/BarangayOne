import { BlotterForm } from "@/components/blotter/blotter-form"
export const dynamic = "force-dynamic"


export default function NewBlotterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">File Blotter Case</h1>
        <p className="text-gray-500">Record a new incident or complaint</p>
      </div>
      <BlotterForm />
    </div>
  )
}
