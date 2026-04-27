import { NextResponse, type NextRequest } from "next/server"
import {
  demoAccessPassword,
  demoAccessUsername,
  demoGateCookieName,
  demoGateEnabled,
  expectedDemoGateToken,
  timingSafeEqualStr,
} from "@/lib/demo-gate"

export async function POST(request: NextRequest) {
  if (!demoGateEnabled()) {
    return NextResponse.json({ error: "Demo access is not configured." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("username" in body) ||
    !("password" in body)
  ) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
  }

  const username = typeof body.username === "string" ? body.username : ""
  const password = typeof body.password === "string" ? body.password : ""

  const envUser = demoAccessUsername()
  const envPass = demoAccessPassword()

  const userOk = timingSafeEqualStr(username, envUser)
  const passOk = timingSafeEqualStr(password, envPass)

  if (!userOk || !passOk) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  }

  const token = await expectedDemoGateToken()
  const res = NextResponse.json({ ok: true })

  res.cookies.set({
    name: demoGateCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}

export async function DELETE() {
  if (!demoGateEnabled()) {
    return NextResponse.json({ ok: true })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: demoGateCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
