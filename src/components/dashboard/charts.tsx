"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { FeedbackRow, PriorityItem } from "@/types"

/** Matches --chart-* tokens in globals.css for theme consistency */
const COLORS = [
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-5)",
  "var(--chart-4)",
  "var(--chart-1)",
]

interface Props {
  rows: FeedbackRow[]
  priorities: PriorityItem[]
}

export default function FeedbackCharts({ rows, priorities }: Props) {
  const categoryData = priorities.map((p) => ({
    name: p.category,
    count: p.count,
  }))

  const tagFreq = new Map<string, number>()
  for (const row of rows) {
    for (const tag of row.tags) {
      tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1)
    }
  }
  const tagData = [...tagFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: `#${name}`, count }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Feedback by category
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              itemStyle={{ color: "var(--primary)" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Top tags
        </h3>
        {tagData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            No tags used yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tagData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: "var(--foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "var(--foreground)" }}
                itemStyle={{ color: "var(--primary)" }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
