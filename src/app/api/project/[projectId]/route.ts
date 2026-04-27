import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProjectConfig } from "@/lib/sheets"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const { searchParams } = new URL(req.url)
  const spreadsheetId = searchParams.get("sid")

  if (!spreadsheetId) {
    return NextResponse.json({ error: "Missing sid" }, { status: 400 })
  }

  // For public form access: try session token, fall back to public read if sheet is shared
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const project = await getProjectConfig(session.accessToken, spreadsheetId)
  if (project.projectId !== projectId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(project)
}
