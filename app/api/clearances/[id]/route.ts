import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminDelete, requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { updateClearanceSchema } from "@/lib/validations/clearance.schema"
import { clearanceService } from "@/services/clearance.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminRead(user)
  const barangayId = requireBarangay(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const clearance = await clearanceService.getById(id, barangayId)
  return NextResponse.json(clearance)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateClearanceSchema.parse(body)
  const actorId = user.id
  const barangayId = requireBarangay(user)
  const clearance = await clearanceService.update(id, data, actorId, barangayId)
  return NextResponse.json(clearance)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminDelete(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = user.id
  const barangayId = requireBarangay(user)
  await clearanceService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

