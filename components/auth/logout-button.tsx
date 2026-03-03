"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Log out
    </Button>
  )
}
