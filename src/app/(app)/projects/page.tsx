import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { computePortfolioStats, type PortfolioStats } from "@/lib/portfolio-stats"
import { getAllFeedback, listUserProjects } from "@/lib/sheets"
import { AddMockDataButton } from "@/components/add-mock-data-button"
import { RemoveAllProjectsButton } from "@/components/remove-all-projects-button"
import { ProjectCardActions } from "@/components/project-card-actions"
import { ProjectsPortfolioSummary } from "@/components/projects-portfolio-summary"
import { RemoveProjectButton } from "@/components/remove-project-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  if (projects.length > 0) {
    try {
      const feedbackByProject = await Promise.all(
        projects.map((p) => getAllFeedback(session.accessToken, p.spreadsheetId))
      )
      portfolio = computePortfolioStats(feedbackByProject)
    } catch (error) {
      if (isSheetsQuotaError(error)) {
        portfolio = { quotaExceeded: true }
      } else {
        throw error
      }
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
          <div className="space-y-3">
            {projects.map((project) => {
              const sid = project.spreadsheetId

              return (
                <Card key={project.projectId} className="border border-border bg-card text-foreground">
                  <CardHeader className="pb-2 space-y-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-lg">{project.projectName}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          projectId: <span className="font-mono">{project.projectId}</span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Link href={`/setup?pid=${encodeURIComponent(project.projectId)}&sid=${encodeURIComponent(sid)}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-border bg-background text-foreground hover:bg-secondary hover:text-primary-foreground"
                          >
                            Edit form
                          </Button>
                        </Link>
                        <RemoveProjectButton
                          projectId={project.projectId}
                          spreadsheetId={sid}
                          projectName={project.projectName}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ProjectCardActions projectId={project.projectId} spreadsheetId={sid} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
