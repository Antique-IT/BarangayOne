"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard, Users, FileText, Shield, Megaphone, Settings, LogOut,
  Home, BarChart3, FileCheck, Activity, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SessionProvider } from "next-auth/react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/residents", icon: Users, label: "Residents" },
  { href: "/dashboard/households", icon: Home, label: "Households" },
  { href: "/dashboard/clearances", icon: FileCheck, label: "Clearances" },
  { href: "/dashboard/blotter", icon: Shield, label: "Blotter Cases" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
  { href: "/dashboard/activity-logs", icon: Activity, label: "Activity Logs" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

function SidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.replace("/login")
    }
  }, [router, session, status])

  if (status === "loading") return (
    <aside className="w-64 border-r bg-white flex flex-col h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">B</span>
        </div>
        <div>
          <span className="font-bold text-gray-900">BarangayOS</span>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>
    </aside>
  )

  if (!session) return null

  const user = session.user as { name?: string; email?: string; role?: string }

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">B</span>
        </div>
        <div>
          <span className="font-bold text-gray-900">BarangayOS</span>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-gray-400")} />
                {item.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto text-indigo-400" />}
              </div>
            </Link>
          )
        })}
      </nav>
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-medium">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <SidebarContent />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
