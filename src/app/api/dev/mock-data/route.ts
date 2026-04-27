import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { appendFeedbackBatch, createProjectSheet } from "@/lib/sheets"
import type { FeedbackRow } from "@/types"
import { nanoid } from "nanoid"

const CATEGORY_POOL = [
  "Bug Report",
  "Feature Request",
  "UX",
  "Performance",
  "Question",
  "Improvement",
  "Documentation",
  "Accessibility",
  "Mobile",
  "Billing",
]

const TAG_POOL = [
  "urgent",
  "nice-to-have",
  "mobile",
  "desktop",
  "beta",
  "regression",
  "polish",
  "security",
  "a11y",
  "onboarding",
  "checkout",
]

const TITLE_ADJECTIVES = [
  "Northwind",
  "Acme",
  "Pulse",
  "River",
  "Nova",
  "Atlas",
  "Beacon",
  "Summit",
]

const TITLE_NOUNS = [
  "Portal",
  "Console",
  "Checkout",
  "Dashboard",
  "Mobile App",
  "API",
  "Website",
  "Workspace",
]

const COMMENT_SNIPPETS = [
  "Looks good overall; minor spacing issue on mobile.",
  "Could we add keyboard shortcuts?",
  "Export failed once but worked on retry.",
  "Love the new flow — faster than before.",
  "Needs clearer error when the session expires.",
  "Dark mode contrast could be stronger on charts.",
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandomSubset<T>(pool: T[], minCount: number, maxCount: number): T[] {
  const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1))
  const cap = Math.min(count, pool.length)
  return shuffle(pool).slice(0, cap)
}

function randomProjectTitle(): string {
  const adj = TITLE_ADJECTIVES[Math.floor(Math.random() * TITLE_ADJECTIVES.length)]
  const noun = TITLE_NOUNS[Math.floor(Math.random() * TITLE_NOUNS.length)]
  return `${adj} ${noun}`
}

const DESCRIPTION_POOL = [
  "Dogfood embed on the staging site — route bugs and UX friction here for the Feb release.",
  "Partner beta: capture what blocks rollout and tag urgent if it breaks core flows.",
  "Weekly CS triage dump; link to Linear is in the dashboard. Context beats one-liners.",
  "Mobile-first review for the redesign. Mention device and OS when something feels off.",
  "Collecting onboarding feedback before we freeze copy. Screenshots welcome.",
  "Internal QA pass for billing — no PII in comments, use session IDs only.",
  "Hack week feedback bucket: wild ideas encouraged, tag nice-to-have if low priority.",
  "Accessibility sweep — flag contrast, focus order, and screen reader issues.",
  "Performance regressions after the CDN cutover. Include slow URLs and repro steps.",
  "Marketing site only; product app bugs go to the other project.",
]

function randomProjectDescription(): string {
  return DESCRIPTION_POOL[Math.floor(Math.random() * DESCRIPTION_POOL.length)]!
}

/** Local development only: creates sample spreadsheets + responses. */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const FORM_COUNT = 5
  const created: Array<{ projectId: string; spreadsheetId: string; submissions: number }> = []

  for (let i = 0; i < FORM_COUNT; i++) {
    const categories = pickRandomSubset(CATEGORY_POOL, 3, 6)
    const tags = pickRandomSubset(TAG_POOL, 3, Math.min(7, TAG_POOL.length))
    const projectId = nanoid(10)

    const spreadsheetId = await createProjectSheet(session.accessToken, {
      projectId,
      projectName: randomProjectTitle(),
      description: randomProjectDescription(),
      categories,
      tags,
      requirements: {
        tagsRequired: false,
        commentRequired: false,
      },
    })

    const submissionCount = 3 + Math.floor(Math.random() * 4)
    const rows: FeedbackRow[] = []

    for (let s = 0; s < submissionCount; s++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const tagPickCount = 1 + Math.floor(Math.random() * Math.min(3, tags.length))
      const submissionTags = shuffle(tags).slice(0, tagPickCount)

      rows.push({
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)
        ).toISOString(),
        category,
        tags: submissionTags,
        comment: COMMENT_SNIPPETS[Math.floor(Math.random() * COMMENT_SNIPPETS.length)],
        sessionId: nanoid(8),
      })
    }

    await appendFeedbackBatch(session.accessToken, spreadsheetId, rows)
    created.push({ projectId, spreadsheetId, submissions: submissionCount })
  }

  return NextResponse.json({ ok: true, created })
}
