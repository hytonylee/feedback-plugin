import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { getProjectConfig, getAllFeedback, saveAiSummary } from "@/lib/sheets"
import { computePriority } from "@/lib/priority"

const COOLDOWN_MS = 10 * 60 * 1000
const MIN_SUBMISSIONS = 5
const MAX_COMMENTS = 200

const client = new Anthropic()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const { sid: spreadsheetId } = await req.json().catch(() => ({}))
  if (!spreadsheetId) {
    return NextResponse.json({ error: "Missing spreadsheetId" }, { status: 400 })
  }

  const [project, rows] = await Promise.all([
    getProjectConfig(session.accessToken, spreadsheetId),
    getAllFeedback(session.accessToken, spreadsheetId),
  ])

  if (project.projectId !== projectId) {
    return NextResponse.json({ error: "Project mismatch" }, { status: 403 })
  }

  if (project.aiSummaryGeneratedAt) {
    const age = Date.now() - new Date(project.aiSummaryGeneratedAt).getTime()
    if (age < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - age) / 1000)
      return NextResponse.json({ error: "cooldown", secondsLeft }, { status: 429 })
    }
  }

  const withComments = rows.filter((r) => r.comment?.trim())
  if (withComments.length < MIN_SUBMISSIONS) {
    return NextResponse.json(
      { error: `Need at least ${MIN_SUBMISSIONS} submissions with comments to generate insights.` },
      { status: 422 }
    )
  }

  // Priority-weighted selection: top 100 by category score + 100 most recent, capped at 200
  const priorities = computePriority(rows)
  const scoreByCategory = new Map(priorities.map((p) => [p.category, p.score]))

  const sorted = [...withComments].sort((a, b) => {
    const sa = scoreByCategory.get(a.category) ?? 0
    const sb = scoreByCategory.get(b.category) ?? 0
    return sb - sa
  })

  const topByScore = sorted.slice(0, 100)
  const recent = [...withComments]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 100)

  const seen = new Set<string>()
  const selected: typeof withComments = []
  for (const row of [...topByScore, ...recent]) {
    const key = `${row.timestamp}|${row.sessionId}`
    if (!seen.has(key)) {
      seen.add(key)
      selected.push(row)
    }
    if (selected.length >= MAX_COMMENTS) break
  }

  const commentLines = selected
    .map((r) => `[${r.category}] ${r.comment.trim()}`)
    .join("\n")

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    output_config: { effort: "high" },
    system:
      "You are a product analyst. Analyze user feedback and return a JSON object with two keys:\n" +
      '- "summary": a 2-3 sentence paragraph summarizing the overall themes and sentiment\n' +
      '- "suggestions": an array of exactly 5 strings, each a concise feature suggestion detected from the feedback\n' +
      "Return only valid JSON, no markdown fences.",
    messages: [
      {
        role: "user",
        content: `Here are ${selected.length} user feedback comments:\n\n${commentLines}`,
      },
    ],
  })

  const text = message.content.find((b) => b.type === "text")?.text ?? ""
  let parsed: { summary: string; suggestions: string[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.suggestions) ||
    parsed.suggestions.length === 0
  ) {
    return NextResponse.json({ error: "Unexpected AI response shape" }, { status: 500 })
  }

  parsed.suggestions = parsed.suggestions.slice(0, 5)

  await saveAiSummary(session.accessToken, spreadsheetId, parsed)

  return NextResponse.json({
    summary: parsed,
    generatedAt: new Date().toISOString(),
  })
}
