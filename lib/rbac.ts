import type { UserRole } from "@/types"

export const ADMIN_ROLES: UserRole[] = ["ADMIN", "SECRETARY"]
export const STAFF_ROLES: UserRole[] = ["SECRETARY"]

export function isAdminRole(role?: string | null): role is UserRole {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
}

export function isStaffRole(role?: string | null): role is UserRole {
  return !!role && STAFF_ROLES.includes(role as UserRole)
}

export function isResidentRole(role?: string | null): role is UserRole {
  return role === "RESIDENT"
}

export function canViewAdminData(role?: string | null) {
  return isAdminRole(role)
}

export function canManageAdminData(role?: string | null) {
  return isAdminRole(role)
}

export function canDeleteAdminData(role?: string | null) {
  return role === "ADMIN"
}
