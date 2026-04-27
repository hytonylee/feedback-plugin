"use client"

import { PriorityScoreHintIcon } from "@/components/priority-score-label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PriorityItem } from "@/types"

export default function PriorityList({ items }: { items: PriorityItem[] }) {
  const maxScore = items[0]?.score ?? 1

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Priority ranking
        </h2>
        <PriorityScoreHintIcon />
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.category}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-mono w-5">#{i + 1}</span>
                <span className="font-medium text-foreground">{item.category}</span>
                {item.recentCount > 0 && (
                  <Badge className="bg-primary/20 text-primary border-border text-xs">
                    +{item.recentCount} this week
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <span className="text-foreground font-semibold">{item.count}</span>
                <span className="text-muted-foreground text-sm ml-1">responses</span>
              </div>
            </div>
            <Progress
              value={(item.score / maxScore) * 100}
              className="h-1.5 bg-muted [&>div]:bg-primary"
            />
            {item.topTags.length > 0 && (
              <div className="flex gap-1.5">
                {item.topTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-border text-muted-foreground text-xs">
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
