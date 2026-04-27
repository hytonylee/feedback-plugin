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

const COLORS = ["#733906", "#8A4508", "#A55010", "#D9A76A", "#C4B898"]

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
      <div className="rounded-xl border border-[#5C4520] bg-[#40331C] p-5 space-y-4">
        <h3 className="text-sm font-medium text-[#A5A6A4] uppercase tracking-wider">
          Feedback by category
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#A5A6A4", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#40331C", border: "1px solid #5C4520", borderRadius: 8 }}
              labelStyle={{ color: "#D9CCB4" }}
              itemStyle={{ color: "#D9A76A" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#5C4520] bg-[#40331C] p-5 space-y-4">
        <h3 className="text-sm font-medium text-[#A5A6A4] uppercase tracking-wider">
          Top tags
        </h3>
        {tagData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-[#7A7A78] text-sm">
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
                tick={{ fill: "#A5A6A4", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#40331C", border: "1px solid #5C4520", borderRadius: 8 }}
                labelStyle={{ color: "#D9CCB4" }}
                itemStyle={{ color: "#D9A76A" }}
              />
              <Bar dataKey="count" fill="#D9A76A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
