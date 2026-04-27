import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createProjectSheet } from "@/lib/sheets"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectName, categories, tags, requirements } = await req.json()
  if (!projectName || !categories?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const projectId = nanoid(10)
  const spreadsheetId = await createProjectSheet(session.accessToken, {
    projectId,
    projectName,
    categories,
    tags: tags ?? [],
    requirements: {
      tagsRequired: Boolean(requirements?.tagsRequired),
      commentRequired: Boolean(requirements?.commentRequired),
    },
  })

  return NextResponse.json({ projectId, spreadsheetId })
}
