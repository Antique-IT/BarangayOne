import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { analyticsService } from "@/services/analytics.service"

export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()

  const barangayId = (session.user as { barangayId?: string }).barangayId
  const data = await analyticsService.getSummary(barangayId)
  return NextResponse.json(data)
})


