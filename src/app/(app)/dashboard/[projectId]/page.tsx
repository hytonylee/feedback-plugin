import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getProjectConfig, getAllFeedback } from "@/lib/sheets"
import { computePriority } from "@/lib/priority"
import PriorityList from "@/components/dashboard/priority-list"
import FeedbackCharts from "@/components/dashboard/charts"
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
        <div className="min-h-screen bg-slate-950 text-white">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <div className="rounded-xl border border-amber-700/40 bg-amber-950/30 p-6">
              <h1 className="text-xl font-semibold text-amber-200">Google Sheets quota reached</h1>
              <p className="mt-2 text-amber-100/80">
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.projectName}</h1>
            <p className="text-slate-400 text-sm mt-1">{rows.length} submissions total</p>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
            {projectId}
          </Badge>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 py-20 text-center text-slate-400">
            <p className="text-lg font-medium text-white">No feedback yet</p>
            <p className="text-sm mt-1">Share your form link to start collecting responses.</p>
          </div>
        ) : (
          <>
            <PriorityList items={priorities} />
            <FeedbackCharts rows={rows} priorities={priorities} />
          </>
        )}
      </div>
    </div>
  )
}
