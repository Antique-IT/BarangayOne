import { NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { analyticsService } from "@/services/analytics.service"

export const GET = withErrorHandler(async () => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const barangayId = requireBarangay(user)
  const data = await analyticsService.getSummary(barangayId)
  return NextResponse.json(data)
})


