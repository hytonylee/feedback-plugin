import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { computePortfolioStats, type PortfolioStats } from "@/lib/portfolio-stats"
import { getAllFeedback, listUserProjects } from "@/lib/sheets"
import type { FeedbackRow } from "@/types"
import { AddMockDataButton } from "@/components/add-mock-data-button"
import { RemoveAllProjectsButton } from "@/components/remove-all-projects-button"
import {
  ProjectsSection,
  type ProjectFilterMeta,
} from "@/components/projects-section"
import { ProjectsPortfolioSummary } from "@/components/projects-portfolio-summary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function deriveProjectFilterMeta(
  projects: { projectId: string }[],
  feedbackByProject: FeedbackRow[][] | null
): ProjectFilterMeta[] {
  return projects.map((p, i) => {
    const rows = feedbackByProject?.[i] ?? []
    const categoriesInFeedback = [...new Set(rows.map((r) => r.category).filter(Boolean))]
    const tagsInFeedback = [...new Set(rows.flatMap((r) => r.tags))]
    return {
      projectId: p.projectId,
      categoriesInFeedback,
      tagsInFeedback,
    }
  })
}

function portfolioFilterOptions(feedbackByProject: FeedbackRow[][] | null): {
  allCategories: string[]
  allTags: string[]
} {
  if (!feedbackByProject) return { allCategories: [], allTags: [] }
  const rows = feedbackByProject.flat()
  const allCategories = [...new Set(rows.map((r) => r.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
  const allTags = [...new Set(rows.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b))
  return { allCategories, allTags }
}

function isSheetsQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const err = error as { code?: number; status?: number; message?: string }
  return (
    err.code === 429 ||
    err.status === 429 ||
    (typeof err.message === "string" && err.message.toLowerCase().includes("quota exceeded"))
  )
}

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const projects = await listUserProjects(session.accessToken)

  let portfolio: PortfolioStats | { quotaExceeded: true } | null = null
  let feedbackByProject: FeedbackRow[][] | null = null

  if (projects.length > 0) {
    try {
      feedbackByProject = await Promise.all(
        projects.map((p) => getAllFeedback(session.accessToken, p.spreadsheetId))
      )
      portfolio = computePortfolioStats(feedbackByProject)
    } catch (error) {
      if (isSheetsQuotaError(error)) {
        portfolio = { quotaExceeded: true }
        feedbackByProject = null
      } else {
        throw error
      }
    }
  }

  const filterMeta = deriveProjectFilterMeta(projects, feedbackByProject)
  const { allCategories, allTags } = portfolioFilterOptions(feedbackByProject)
  const filterDataAvailable = feedbackByProject !== null

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your projects</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Copy embed code, open the public form, or jump to the dashboard from each card.
            </p>
          </div>
          <div className="flex flex-wrap items-start justify-end gap-3">
            {process.env.NODE_ENV === "development" ? (
              <>
                <AddMockDataButton />
                <RemoveAllProjectsButton projectCount={projects.length} />
              </>
            ) : null}
            <Link href="/setup">
              <Button className="bg-primary hover:bg-secondary text-primary-foreground">
                Generate form
              </Button>
            </Link>
          </div>
        </div>

        {portfolio && projects.length > 0 && (
          <ProjectsPortfolioSummary
            projectCount={projects.length}
            quotaExceeded={"quotaExceeded" in portfolio}
            totalSubmissions={"quotaExceeded" in portfolio ? 0 : portfolio.totalSubmissions}
            recentSubmissions={"quotaExceeded" in portfolio ? 0 : portfolio.recentSubmissions}
            projectsWithFeedback={
              "quotaExceeded" in portfolio ? 0 : portfolio.projectsWithFeedback
            }
            distinctCategories={"quotaExceeded" in portfolio ? 0 : portfolio.distinctCategories}
            topPriority={"quotaExceeded" in portfolio ? null : portfolio.topPriority}
          />
        )}

        {projects.length === 0 ? (
          <Card className="border border-border bg-card text-foreground">
            <CardContent className="py-10 text-muted-foreground text-sm">
              No projects yet. Create your first project in setup.
            </CardContent>
          </Card>
        ) : (
          <ProjectsSection
            projects={projects}
            filterMeta={filterMeta}
            allCategories={allCategories}
            allTags={allTags}
            filterDataAvailable={filterDataAvailable}
          />
        )}
      </div>
    </main>
  )
}
