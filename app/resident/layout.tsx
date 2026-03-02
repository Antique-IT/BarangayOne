import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { isResidentRole } from "@/lib/rbac"

const navItems = [
  { href: "/resident/dashboard", label: "Dashboard" },
  { href: "/resident/profile", label: "Profile" },
  { href: "/resident/requests", label: "Requests" },
  { href: "/resident/blotter", label: "Blotter" },
]

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (!isResidentRole(session.user.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Resident Portal</h1>
            <p className="text-sm text-gray-500">BarangayOS self-service portal</p>
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
