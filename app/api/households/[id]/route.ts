import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { updateHouseholdSchema } from "@/lib/validations/household.schema"
import { householdService } from "@/services/household.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const household = await householdService.getById(id)
  return NextResponse.json(household)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateHouseholdSchema.parse(body)
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  const household = await householdService.update(id, data, actorId, barangayId)
  return NextResponse.json(household)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  await householdService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

