import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isAdminRole, isResidentRole } from "@/lib/rbac"

const LEGACY_ADMIN_PREFIXES = [
  "/residents",
  "/households",
  "/clearances",
  "/blotter",
  "/announcements",
  "/analytics",
  "/reports",
  "/settings",
  "/activity-logs",
]

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/public/verify" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public/")

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isAdminRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/") || startsWithAny(pathname, LEGACY_ADMIN_PREFIXES)
  const isResidentRoute = pathname === "/resident" || pathname.startsWith("/resident/")
  const isApiRoute = pathname.startsWith("/api/")
  const isProtectedApiRoute = isApiRoute && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/public/")

  if ((isAdminRoute || isResidentRoute || isProtectedApiRoute) && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  if (isProtectedApiRoute && token && !isAdminRole(token.role) && !isResidentRole(token.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (isResidentRoute && !isResidentRole(token?.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isAdminRoute && !isAdminRole(token?.role)) {
    if (isResidentRole(token?.role)) {
      return NextResponse.redirect(new URL("/resident/dashboard", request.url))
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
