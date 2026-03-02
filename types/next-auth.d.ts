import type { UserRole } from "@/types"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      barangayId?: string | null
      residentId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    barangayId?: string | null
    residentId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    barangayId?: string | null
    residentId?: string | null
  }
}
