import type { UserRole } from "@/types"

export const ADMIN_ROLES: UserRole[] = ["ADMIN", "SECRETARY"]

export function isAdminRole(role?: string | null): role is UserRole {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
}

export function isResidentRole(role?: string | null): role is UserRole {
  return role === "RESIDENT"
}
