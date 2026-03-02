import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"

export const GET = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const barangayId = (session.user as { barangayId?: string }).barangayId

  const result = await activityLogRepository.findMany({ barangayId, page, limit })
  return NextResponse.json(result)
})

