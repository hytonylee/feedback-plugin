import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getProjectConfig, getAllFeedback } from "@/lib/sheets"
import { computePriority } from "@/lib/priority"
import PriorityList from "@/components/dashboard/priority-list"
import FeedbackCharts from "@/components/dashboard/charts"
import FeedbackCommentsTable from "@/components/dashboard/feedback-comments-table"
import { Badge } from "@/components/ui/badge"

interface Props {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ sid?: string }>
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const { projectId } = await params
  const { sid: spreadsheetId } = await searchParams
  if (!spreadsheetId) notFound()

  let project
  let rows
  try {
    ;[project, rows] = await Promise.all([
      getProjectConfig(session.accessToken, spreadsheetId),
      getAllFeedback(session.accessToken, spreadsheetId),
    ])
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("quota exceeded")
    ) {
      return (
        <div className="min-h-screen bg-background text-foreground">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h1 className="text-xl font-semibold text-primary">Google Sheets quota reached</h1>
              <p className="mt-2 text-muted-foreground">
                Your dashboard is getting rate-limited by the Google Sheets API. Wait about a
                minute and refresh.
              </p>
            </div>
          </div>
        </div>
      )
    }

    throw error
  }

  const priorities = computePriority(rows)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.projectName}</h1>
            <p className="text-muted-foreground text-sm mt-1">{rows.length} submissions total</p>
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground font-mono text-xs">
            {projectId}
          </Badge>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium text-foreground">No feedback yet</p>
            <p className="text-sm mt-1">Share your form link to start collecting responses.</p>
          </div>
        ) : (
          <>
            <PriorityList items={priorities} />
            <FeedbackCharts rows={rows} priorities={priorities} />
            <FeedbackCommentsTable rows={rows} />
          </>
        )}
      </div>
    </div>
  )
}
