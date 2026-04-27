"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function AddMockDataButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dev/mock-data", { method: "POST" })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data?.error ?? "Failed to add mock data")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        title="Creates sample Google Sheets projects with fake submissions (localhost only)"
        className="border-primary/35 bg-background text-foreground hover:bg-primary/15"
      >
        {loading ? "Adding…" : "Add mock data"}
      </Button>
      <span className="text-[10px] font-medium uppercase tracking-wide text-foreground/55">
        Dev only
      </span>
      {error ? <span className="text-xs text-red-900 max-w-56 text-right">{error}</span> : null}
    </div>
  )
}
