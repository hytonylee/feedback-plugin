"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type Props = {
  projectCount: number
}

export function RemoveAllProjectsButton({ projectCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setError(null)
    const ok = window.confirm(
      "Remove ALL feedback projects?\n\nEvery Feedback spreadsheet in your Google Drive will be moved to trash. This cannot be undone here."
    )
    if (!ok) return

    setLoading(true)
    try {
      const res = await fetch("/api/dev/remove-all", { method: "POST" })
      const data = (await res.json()) as {
        error?: string
        removedCount?: number
        failedCount?: number
      }
      if (!res.ok) throw new Error(data?.error ?? "Failed to remove projects")
      if (data.failedCount && data.failedCount > 0) {
        setError(`Removed ${data.removedCount ?? 0}; ${data.failedCount} failed.`)
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const disabled = loading || projectCount === 0

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled}
        title={
          projectCount === 0
            ? "No projects to remove"
            : "Trash every Feedback spreadsheet (localhost only)"
        }
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {loading ? "Removing…" : "Remove all"}
      </Button>
      <span className="text-[10px] font-medium uppercase tracking-wide text-foreground/55">
        Dev only
      </span>
      {error ? <span className="text-xs text-red-900 max-w-56 text-right">{error}</span> : null}
    </div>
  )
}
