import type { FeedbackRow, PriorityItem } from "@/types"

export function computePriority(rows: FeedbackRow[]): PriorityItem[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const byCategory = new Map<string, FeedbackRow[]>()

  for (const row of rows) {
    if (!byCategory.has(row.category)) byCategory.set(row.category, [])
    byCategory.get(row.category)!.push(row)
  }

  const items: PriorityItem[] = []

  for (const [category, entries] of byCategory) {
    const count = entries.length
    const recentCount = entries.filter(
      (r) => new Date(r.timestamp).getTime() > sevenDaysAgo
    ).length

    const tagFreq = new Map<string, number>()
    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1)
      }
    }
    const uniqueTagCount = tagFreq.size
    const topTags = [...tagFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag)

    const score = count * 1.0 + uniqueTagCount * 0.5 + recentCount * 0.3

    items.push({ category, score, count, topTags, recentCount })
  }

  return items.sort((a, b) => b.score - a.score)
}
