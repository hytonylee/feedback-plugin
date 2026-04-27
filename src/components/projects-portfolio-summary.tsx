import type { PriorityItem } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PriorityScoreLabel } from "@/components/priority-score-label"

type Props = {
  projectCount: number
  totalSubmissions: number
  recentSubmissions: number
  projectsWithFeedback: number
  distinctCategories: number
  topPriority: PriorityItem | null
  quotaExceeded?: boolean
}

export function ProjectsPortfolioSummary({
  projectCount,
  totalSubmissions,
  recentSubmissions,
  projectsWithFeedback,
  distinctCategories,
  topPriority,
  quotaExceeded,
}: Props) {
  if (quotaExceeded) {
    return (
      <Card className="border border-border bg-card text-foreground">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Could not load portfolio stats (Google Sheets quota). Wait about a minute and refresh.
        </CardContent>
      </Card>
    )
  }

  const statClass =
    "rounded-lg border border-border bg-background px-4 py-3 text-center sm:text-left"

  return (
    <Card className="border border-border bg-card text-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Across all projects
        </CardTitle>
        <p className="text-xs text-muted-foreground font-normal">
          Combined feedback from every project below.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total submissions</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totalSubmissions}</p>
          </div>
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Last 7 days</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
              {recentSubmissions}
            </p>
          </div>
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Projects with feedback</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {projectsWithFeedback}
              <span className="text-muted-foreground text-base font-normal"> / {projectCount}</span>
            </p>
          </div>
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active categories</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{distinctCategories}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current priority (portfolio)
          </p>
          {topPriority ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2 min-w-0">
                <p className="text-lg font-semibold text-foreground">{topPriority.category}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    <span className="text-foreground font-medium">{topPriority.count}</span>{" "}
                    responses
                  </span>
                  {topPriority.recentCount > 0 && (
                    <Badge className="bg-primary/20 text-primary border-border text-xs">
                      +{topPriority.recentCount} this week
                    </Badge>
                  )}
                </div>
                {topPriority.topTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {topPriority.topTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-border text-muted-foreground text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <PriorityScoreLabel />
                <p className="mt-0.5 text-xl font-mono font-semibold text-primary tabular-nums">
                  {topPriority.score >= 10
                    ? topPriority.score.toFixed(1)
                    : topPriority.score.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No feedback yet. Share form links from your projects to see portfolio priority here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
