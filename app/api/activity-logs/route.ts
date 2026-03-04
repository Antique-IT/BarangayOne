import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const barangayId = requireBarangay(user)

  const result = await activityLogRepository.findMany({ barangayId, page, limit })
  return NextResponse.json(result)
})

