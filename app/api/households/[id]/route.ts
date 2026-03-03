import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminDelete, requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { updateHouseholdSchema } from "@/lib/validations/household.schema"
import { householdService } from "@/services/household.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminRead(user)
  const barangayId = requireBarangay(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const household = await householdService.getById(id, barangayId)
  return NextResponse.json(household)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateHouseholdSchema.parse(body)
  const actorId = user.id
  const barangayId = requireBarangay(user)
  const household = await householdService.update(id, data, actorId, barangayId)
  return NextResponse.json(household)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminDelete(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = user.id
  const barangayId = requireBarangay(user)
  await householdService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

