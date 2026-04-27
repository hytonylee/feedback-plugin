import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listUserProjects, trashProjectSpreadsheet } from "@/lib/sheets"

/** Local development only: trash every Feedback project spreadsheet for the signed-in user. */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await listUserProjects(session.accessToken)
  let removedCount = 0
  const failed: string[] = []

  for (const p of projects) {
    try {
      await trashProjectSpreadsheet(session.accessToken, p.spreadsheetId)
      removedCount++
    } catch {
      failed.push(p.projectId)
    }
  }

  return NextResponse.json({
    ok: true,
    removedCount,
    failedCount: failed.length,
    failedProjectIds: failed,
  })
}
