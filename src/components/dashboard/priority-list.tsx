"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PriorityItem } from "@/types"

export default function PriorityList({ items }: { items: PriorityItem[] }) {
  const maxScore = items[0]?.score ?? 1

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-[#A5A6A4] uppercase tracking-wider">Priority ranking</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.category}
            className="rounded-xl border border-[#5C4520] bg-[#40331C] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[#7A7A78] text-sm font-mono w-5">#{i + 1}</span>
                <span className="font-medium text-[#D9CCB4]">{item.category}</span>
                {item.recentCount > 0 && (
                  <Badge className="bg-[#733906]/30 text-[#D9A76A] border-[#733906] text-xs">
                    +{item.recentCount} this week
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <span className="text-[#C4B898] font-semibold">{item.count}</span>
                <span className="text-[#7A7A78] text-sm ml-1">responses</span>
              </div>
            </div>
            <Progress
              value={(item.score / maxScore) * 100}
              className="h-1.5 bg-[#4A3518] [&>div]:bg-[#D9A76A]"
            />
            {item.topTags.length > 0 && (
              <div className="flex gap-1.5">
                {item.topTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-[#5C4520] text-[#A5A6A4] text-xs">
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
