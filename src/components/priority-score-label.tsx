"use client"

import { Tooltip } from "@base-ui/react/tooltip"
import { CircleHelp } from "lucide-react"

import { PRIORITY_SCORE_DESCRIPTION } from "@/lib/priority"
import { cn } from "@/lib/utils"

const popupClassName = cn(
  "max-w-[min(18rem,calc(100vw-1.5rem))] rounded-md border border-border bg-background px-3 py-2 text-left",
  "text-xs leading-snug text-foreground shadow-md",
  "origin-(--transform-origin) transition-[transform,opacity] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0"
)

const triggerClassName = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-foreground/45",
  "outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
)

function PriorityScoreTooltipPopup({ align }: { align: "start" | "end" }) {
  return (
    <Tooltip.Portal>
      <Tooltip.Positioner side="top" align={align} sideOffset={6}>
        <Tooltip.Popup className={popupClassName}>{PRIORITY_SCORE_DESCRIPTION}</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  )
}

/** Help icon explaining priority score (for section headers). */
export function PriorityScoreHintIcon({ className }: { className?: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={150}
        type="button"
        className={cn(triggerClassName, "-ml-0.5", className)}
        aria-label="How priority score is calculated"
      >
        <CircleHelp className="size-3.5" strokeWidth={2} aria-hidden />
      </Tooltip.Trigger>
      <PriorityScoreTooltipPopup align="start" />
    </Tooltip.Root>
  )
}

type LabelProps = {
  className?: string
}

export function PriorityScoreLabel({ className }: LabelProps) {
  return (
    <Tooltip.Root>
      <div className={cn("flex items-center justify-end gap-1", className)}>
        <p className="text-xs text-muted-foreground">Priority score</p>
        <Tooltip.Trigger
          delay={150}
          type="button"
          className={triggerClassName}
          aria-label="How priority score is calculated"
        >
          <CircleHelp className="size-3.5" strokeWidth={2} aria-hidden />
        </Tooltip.Trigger>
      </div>
      <PriorityScoreTooltipPopup align="end" />
    </Tooltip.Root>
  )
}
