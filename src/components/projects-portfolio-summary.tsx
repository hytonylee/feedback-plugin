import type { PriorityItem } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
      <Card className="bg-amber-950/30 border-amber-700/40 text-white">
        <CardContent className="py-4 text-sm text-amber-100/90">
          Could not load portfolio stats (Google Sheets quota). Wait about a minute and refresh.
        </CardContent>
      </Card>
    )
  }

  const statClass =
    "rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-3 text-center sm:text-left"

  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-100">
          Across all projects
        </CardTitle>
        <p className="text-xs text-slate-500 font-normal">
          Combined feedback from every project below.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total submissions</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totalSubmissions}</p>
          </div>
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Last 7 days</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-violet-300">
              {recentSubmissions}
            </p>
          </div>
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Projects with feedback</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {projectsWithFeedback}
              <span className="text-slate-500 text-base font-normal"> / {projectCount}</span>
            </p>
          </div>
          <div className={statClass}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Active categories</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{distinctCategories}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Current priority (portfolio)
          </p>
          {topPriority ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2 min-w-0">
                <p className="text-lg font-semibold text-white">{topPriority.category}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>
                    <span className="text-slate-300 font-medium">{topPriority.count}</span>{" "}
                    responses
                  </span>
                  {topPriority.recentCount > 0 && (
                    <Badge className="bg-violet-900/50 text-violet-300 border-violet-700 text-xs">
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
                        className="border-slate-700 text-slate-400 text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">Priority score</p>
                <p className="text-xl font-mono font-semibold text-violet-400 tabular-nums">
                  {topPriority.score >= 10
                    ? topPriority.score.toFixed(1)
                    : topPriority.score.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              No feedback yet. Share form links from your projects to see portfolio priority here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
