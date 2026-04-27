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

const COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764"]

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
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Feedback by category
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#a78bfa" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Top tags
        </h3>
        {tagData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
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
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#22d3ee" }}
              />
              <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
