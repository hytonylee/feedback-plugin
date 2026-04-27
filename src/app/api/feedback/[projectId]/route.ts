import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { appendFeedback, getProjectConfig } from "@/lib/sheets"
import { nanoid } from "nanoid"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { category, tags, comment, spreadsheetId } = await req.json()

  if (!projectId || !category || !spreadsheetId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const project = await getProjectConfig(session.accessToken, spreadsheetId)
  if (project.projectId !== projectId) {
    return NextResponse.json({ error: "Project mismatch" }, { status: 400 })
  }

  if (project.requirements.tagsRequired && (!Array.isArray(tags) || tags.length === 0)) {
    return NextResponse.json({ error: "Tags are required" }, { status: 400 })
  }

  if (project.requirements.commentRequired && !String(comment ?? "").trim()) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 })
  }

  await appendFeedback(session.accessToken, spreadsheetId, {
    timestamp: new Date().toISOString(),
    category,
    tags: tags ?? [],
    comment: comment ?? "",
    sessionId: nanoid(8),
  })

  return NextResponse.json({ ok: true })
}
