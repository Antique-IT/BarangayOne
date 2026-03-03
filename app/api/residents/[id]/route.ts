import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminDelete, requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { updateResidentSchema } from "@/lib/validations/resident.schema"
import { residentService } from "@/services/resident.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminRead(user)
  const barangayId = requireBarangay(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const resident = await residentService.getById(id, barangayId)
  return NextResponse.json(resident)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateResidentSchema.parse(body)
  const actorId = user.id
  const barangayId = requireBarangay(user)
  const resident = await residentService.update(id, data, actorId, barangayId)
  return NextResponse.json(resident)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminDelete(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = user.id
  const barangayId = requireBarangay(user)
  await residentService.archive(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

