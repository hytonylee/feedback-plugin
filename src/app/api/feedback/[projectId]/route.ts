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
  const accessToken = session?.accessToken ?? null

  const { category, tags, comment, spreadsheetId } = await req.json()

  if (!projectId || !category || !spreadsheetId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const project = await getProjectConfig(accessToken, spreadsheetId)
    if (project.projectId !== projectId) {
      return NextResponse.json({ error: "Project mismatch" }, { status: 400 })
    }

    if (project.requirements.tagsRequired && (!Array.isArray(tags) || tags.length === 0)) {
      return NextResponse.json({ error: "Tags are required" }, { status: 400 })
    }

    if (project.requirements.commentRequired && !String(comment ?? "").trim()) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 })
    }

    await appendFeedback(accessToken, spreadsheetId, {
      timestamp: new Date().toISOString(),
      category,
      tags: tags ?? [],
      comment: comment ?? "",
      sessionId: nanoid(8),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : undefined
    if (code === "PUBLIC_FORMS_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Public form submissions are not enabled on this server (missing GOOGLE_SERVICE_ACCOUNT_JSON).",
          code,
        },
        { status: 503 }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to submit feedback"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
