"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PriorityItem } from "@/types"

export default function PriorityList({ items }: { items: PriorityItem[] }) {
  const maxScore = items[0]?.score ?? 1

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Priority ranking</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.category}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm font-mono w-5">#{i + 1}</span>
                <span className="font-medium text-white">{item.category}</span>
                {item.recentCount > 0 && (
                  <Badge className="bg-violet-900/50 text-violet-300 border-violet-700 text-xs">
                    +{item.recentCount} this week
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-300 font-semibold">{item.count}</span>
                <span className="text-slate-500 text-sm ml-1">responses</span>
              </div>
            </div>
            <Progress
              value={(item.score / maxScore) * 100}
              className="h-1.5 bg-slate-800 [&>div]:bg-violet-500"
            />
            {item.topTags.length > 0 && (
              <div className="flex gap-1.5">
                {item.topTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-slate-700 text-slate-400 text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
