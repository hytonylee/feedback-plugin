import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  demoGateCookieName,
  demoGateEnabled,
  isDemoGatePublicPath,
  verifyDemoGateToken,
} from "@/lib/demo-gate"

function isAuthPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true
  if (pathname.startsWith("/api/auth")) return true
  if (pathname.startsWith("/form/")) return true
  if (pathname.startsWith("/api/project/")) return true
  if (pathname.startsWith("/api/feedback/")) return true
  if (pathname === "/demo-access") return true
  if (pathname.startsWith("/api/demo-access")) return true
  return false
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname

  if (demoGateEnabled()) {
    if (!isDemoGatePublicPath(pathname)) {
      const token = req.cookies.get(demoGateCookieName())?.value
      if (!(await verifyDemoGateToken(token))) {
        const loginUrl = new URL("/demo-access", req.url)
        const callback = `${pathname}${req.nextUrl.search}`
        loginUrl.searchParams.set("callbackUrl", callback || "/")
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  if (isAuthPublicPath(pathname)) {
    if (pathname === "/login" && req.auth) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  if (!req.auth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/login", req.url)
    const callback = `${pathname}${req.nextUrl.search}`
    loginUrl.searchParams.set("callbackUrl", callback || "/")
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
