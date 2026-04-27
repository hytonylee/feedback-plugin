import { NextResponse, type NextRequest } from "next/server"
import {
  demoGateCookieName,
  demoGateEnabled,
  isDemoGatePublicPath,
  verifyDemoGateToken,
} from "@/lib/demo-gate"

export async function middleware(request: NextRequest) {
  if (!demoGateEnabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (isDemoGatePublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(demoGateCookieName())?.value
  if (await verifyDemoGateToken(token)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/demo-access", request.url)
  const callback = `${pathname}${request.nextUrl.search}`
  loginUrl.searchParams.set("callbackUrl", callback || "/")

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
