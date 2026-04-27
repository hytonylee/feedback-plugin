import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProjectConfig, trashProjectSpreadsheet } from "@/lib/sheets"

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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const { searchParams } = new URL(_req.url)
  const spreadsheetId = searchParams.get("sid")

  if (!spreadsheetId) {
    return NextResponse.json({ error: "Missing sid" }, { status: 400 })
  }

  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const project = await getProjectConfig(session.accessToken, spreadsheetId)
    if (project.projectId !== projectId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    await trashProjectSpreadsheet(session.accessToken, spreadsheetId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
