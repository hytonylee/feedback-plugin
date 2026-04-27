import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProjectConfig, trashProjectSpreadsheet, updateProjectConfig } from "@/lib/sheets"

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

  const session = await auth()
  const accessToken = session?.accessToken ?? null

  try {
    const project = await getProjectConfig(accessToken, spreadsheetId)
    if (project.projectId !== projectId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : undefined
    if (code === "PUBLIC_FORMS_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Public forms are not enabled on this server yet (missing GOOGLE_SERVICE_ACCOUNT_JSON).",
          code,
        },
        { status: 503 }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to load project"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const { searchParams } = new URL(req.url)
  const spreadsheetId = searchParams.get("sid")

  if (!spreadsheetId) {
    return NextResponse.json({ error: "Missing sid" }, { status: 400 })
  }

  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const projectName = typeof body?.projectName === "string" ? body.projectName.trim() : ""
  const description = typeof body?.description === "string" ? body.description : ""
  const categories = body?.categories
  const tags = body?.tags
  const requirements = body?.requirements

  if (!projectName || !Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const project = await getProjectConfig(session.accessToken, spreadsheetId)
    if (project.projectId !== projectId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await updateProjectConfig(session.accessToken, spreadsheetId, {
      projectName,
      description,
      categories: categories.map(String),
      tags: Array.isArray(tags) ? tags.map(String) : [],
      requirements: {
        tagsRequired: Boolean(requirements?.tagsRequired),
        commentRequired: Boolean(requirements?.commentRequired),
      },
    })

    return NextResponse.json({ ok: true, projectId, spreadsheetId })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
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
