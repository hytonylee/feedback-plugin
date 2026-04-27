import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listUserProjects } from "@/lib/sheets"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await listUserProjects(session.accessToken)
  return NextResponse.json({ projects })
}
