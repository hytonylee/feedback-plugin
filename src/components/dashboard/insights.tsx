"use client"

import { useState } from "react"
import type { AiSummary } from "@/types"

interface Props {
  projectId: string
  spreadsheetId: string
  initialSummary?: AiSummary
  initialGeneratedAt?: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function InsightsCard({
  projectId,
  spreadsheetId,
  initialSummary,
  initialGeneratedAt,
}: Props) {
  const [summary, setSummary] = useState<AiSummary | undefined>(initialSummary)
  const [generatedAt, setGeneratedAt] = useState<string | undefined>(initialGeneratedAt)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  async function regenerate() {
    setLoading(true)
    setError(null)
    setCooldownSeconds(0)

    try {
      const res = await fetch(`/api/summary/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: spreadsheetId }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setCooldownSeconds(data.secondsLeft ?? 600)
        setError(null)
        setLoading(false)
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to generate insights")
        setLoading(false)
        return
      }

      const data = await res.json()
      setSummary(data.summary)
      setGeneratedAt(data.generatedAt)
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  const cooldownMins = Math.ceil(cooldownSeconds / 60)

  return (
    <div className="rounded-xl border border-[#5C4520] bg-[#40331C] p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-[#A5A6A4] uppercase tracking-wider">
            AI insights
          </h2>
          {generatedAt && (
            <p className="text-xs text-[#7A7A78] mt-0.5">Updated {timeAgo(generatedAt)}</p>
          )}
        </div>
        <button
          onClick={regenerate}
          disabled={loading || cooldownSeconds > 0}
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating…" : cooldownSeconds > 0 ? `Wait ${cooldownMins}m` : "Regenerate"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-[#D9A76A]/80 bg-[#733906]/20 rounded-lg px-3 py-2">{error}</p>
      )}

      {!summary && !loading && !error && (
        <p className="text-sm text-[#7A7A78]">
          No insights yet. Click Regenerate to analyze your feedback with AI.
        </p>
      )}

      {loading && !summary && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-[#5C4520] rounded w-full" />
          <div className="h-3 bg-[#5C4520] rounded w-5/6" />
          <div className="h-3 bg-[#5C4520] rounded w-4/6" />
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <p className="text-sm text-[#D9CCB4] leading-relaxed">{summary.summary}</p>
          <div>
            <h3 className="text-xs font-medium text-[#A5A6A4] uppercase tracking-wider mb-2">
              Top feature suggestions
            </h3>
            <ul className="space-y-1.5">
              {summary.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#C4B898]">
                  <span className="text-[#D9A76A] font-mono shrink-0">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
