import type { FeedbackRow } from "@/types"

import { computePriority } from "@/lib/priority"

export type PortfolioStats = {
  totalSubmissions: number
  recentSubmissions: number
  projectsWithFeedback: number
  distinctCategories: number
  topPriority: ReturnType<typeof computePriority>[number] | null
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/** Aggregates feedback rows across projects for the projects dashboard. */
export function computePortfolioStats(feedbackByProject: FeedbackRow[][]): PortfolioStats {
  const allRows = feedbackByProject.flat()
  const priorities = computePriority(allRows)
  const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS
  return {
    totalSubmissions: allRows.length,
    recentSubmissions: allRows.filter((r) => new Date(r.timestamp).getTime() > sevenDaysAgo).length,
    projectsWithFeedback: feedbackByProject.filter((rows) => rows.length > 0).length,
    distinctCategories: priorities.length,
    topPriority: priorities[0] ?? null,
  }
}
