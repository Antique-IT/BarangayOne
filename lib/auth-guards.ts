import { getServerSession } from "next-auth"
import type { UserRole } from "@/types"
import { authOptions } from "@/lib/auth"
import { forbidden, unauthorized } from "@/lib/api-error"
import { canDeleteAdminData, canManageAdminData, canViewAdminData, isResidentRole } from "@/lib/rbac"

export type SessionUser = {
  id?: string
  role?: UserRole
  barangayId?: string | null
  residentId?: string | null
}

export async function requireSessionUser() {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized("Please log in to continue")
  return session.user as SessionUser
}

export function requireBarangay(user: SessionUser) {
  if (!user.barangayId) {
    throw unauthorized("No barangay assigned")
  }
  return user.barangayId
}

export function requireAdminRead(user: SessionUser) {
  if (!canViewAdminData(user.role)) {
    throw forbidden("Access denied: this resource requires Admin or Staff role")
  }
}

export function requireAdminWrite(user: SessionUser) {
  if (!canManageAdminData(user.role)) {
    throw forbidden("Access denied: this action requires Admin or Staff role")
  }
}

export function requireAdminDelete(user: SessionUser) {
  if (!canDeleteAdminData(user.role)) {
    throw forbidden("Access denied: only Admin can delete resources")
  }
}

export function requireResidentRole(user: SessionUser) {
  if (!isResidentRole(user.role)) {
    throw forbidden("Access denied: resident account required")
  }
}
