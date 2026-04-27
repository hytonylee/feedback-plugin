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

const COLORS = ["#FF5A5A", "#FF8B5A", "#FFA95A", "#FFD45A", "#2B1F0E"]

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
      <div className="rounded-xl border border-[#FF8B5A] bg-[#FFA95A] p-5 space-y-4">
        <h3 className="text-sm font-medium text-[#2B1F0E]/70 uppercase tracking-wider">
          Feedback by category
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#2B1F0E", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#FFA95A", border: "1px solid #FF8B5A", borderRadius: 8 }}
              labelStyle={{ color: "#2B1F0E" }}
              itemStyle={{ color: "#FF5A5A" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#FF8B5A] bg-[#FFA95A] p-5 space-y-4">
        <h3 className="text-sm font-medium text-[#2B1F0E]/70 uppercase tracking-wider">
          Top tags
        </h3>
        {tagData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-[#2B1F0E]/60 text-sm">
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
                tick={{ fill: "#2B1F0E", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#FFA95A", border: "1px solid #FF8B5A", borderRadius: 8 }}
                labelStyle={{ color: "#2B1F0E" }}
                itemStyle={{ color: "#FF5A5A" }}
              />
              <Bar dataKey="count" fill="#FF5A5A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
