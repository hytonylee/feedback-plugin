"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Step = "name" | "categories" | "tags" | "done"

interface DoneState {
  projectId: string
  spreadsheetId: string
}

type Props = {
  editProjectId?: string
  editSpreadsheetId?: string
}

export default function SetupWizard({
  editProjectId,
  editSpreadsheetId,
}: Props = {}) {
  const isEditIntent = Boolean(editProjectId && editSpreadsheetId)
  const [bootError, setBootError] = useState<string | null>(null)
  const [booting, setBooting] = useState(isEditIntent)

  const [step, setStep] = useState<Step>("name")
  const [projectName, setProjectName] = useState("")
  const [categories, setCategories] = useState<string[]>(["Bug Report", "Feature Request", "Improvement", "Question"])
  const [tags, setTags] = useState<string[]>(["urgent", "nice-to-have", "ux", "performance", "mobile"])
  const [catInput, setCatInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [requirements, setRequirements] = useState({
    tagsRequired: false,
    commentRequired: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<DoneState | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const pid = editProjectId
    const sid = editSpreadsheetId
    if (!pid || !sid) return

    let cancelled = false
    async function load(projectId: string, spreadsheetId: string) {
      setBootError(null)
      setBooting(true)
      try {
        const res = await fetch(
          `/api/project/${encodeURIComponent(projectId)}?sid=${encodeURIComponent(spreadsheetId)}`
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(typeof data?.error === "string" ? data.error : "Could not load project")
        }
        if (cancelled) return
        setProjectName(data.projectName ?? "")
        setCategories(Array.isArray(data.categories) ? data.categories : [])
        setTags(Array.isArray(data.tags) ? data.tags : [])
        if (data.requirements && typeof data.requirements === "object") {
          setRequirements({
            tagsRequired: Boolean(data.requirements.tagsRequired),
            commentRequired: Boolean(data.requirements.commentRequired),
          })
        }
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : "Could not load project")
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    }
    void load(pid, sid)
    return () => {
      cancelled = true
    }
  }, [editProjectId, editSpreadsheetId])

  const addCategory = () => {
    const val = catInput.trim()
    if (val && !categories.includes(val)) setCategories([...categories, val])
    setCatInput("")
  }

  const addTag = () => {
    const val = tagInput.trim()
    if (val && !tags.includes(val)) setTags([...tags, val])
    setTagInput("")
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isEditIntent && editProjectId && editSpreadsheetId) {
        const res = await fetch(
          `/api/project/${encodeURIComponent(editProjectId)}?sid=${encodeURIComponent(editSpreadsheetId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectName, categories, tags, requirements }),
          }
        )
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setDone({
            projectId: editProjectId,
            spreadsheetId: editSpreadsheetId,
          })
          setStep("done")
        } else {
          setError(data?.error ?? "Failed to save changes. Please try again.")
        }
      } else {
        const res = await fetch("/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectName, categories, tags, requirements }),
        })
        const data = await res.json()
        if (res.ok) {
          setDone(data)
          setStep("done")
        } else {
          setError(data?.error ?? "Failed to create form. Please try again.")
        }
      }
    } catch {
      setError("Could not reach the server. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const embedCode = done
    ? `<iframe src="${window.location.origin}/form/${done.projectId}?sid=${done.spreadsheetId}" width="100%" height="520" frameborder="0" style="border-radius:12px"></iframe>`
    : ""

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-slate-900 border-slate-700 text-white">
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            Loading project…
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bootError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-slate-900 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Could not open project</CardTitle>
            <CardDescription className="text-slate-400">{bootError}</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/projects">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                Back to your projects
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  const editing = isEditIntent

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-700 text-white">
        {step === "name" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl">
                {editing ? "Update your project" : "Name your project"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {editing
                  ? "Change the name or continue to update categories, tags, and form rules."
                  : "This is what your team will see on the dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Project name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme App v2 Feedback"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && projectName && setStep("categories")}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-500"
                disabled={!projectName.trim()}
                onClick={() => setStep("categories")}
              >
                Continue →
              </Button>
            </CardContent>
          </>
        )}

        {step === "categories" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Feedback categories</CardTitle>
              <CardDescription className="text-slate-400">
                Users will pick one category per submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="cursor-pointer bg-slate-700 hover:bg-red-900/50 text-slate-200"
                    onClick={() => setCategories(categories.filter((x) => x !== c))}
                  >
                    {c} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add category..."
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button variant="outline" onClick={addCategory} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Add
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("name")} className="text-slate-400">
                  ← Back
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-500"
                  disabled={categories.length === 0}
                  onClick={() => setStep("tags")}
                >
                  Continue →
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === "tags" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Tags</CardTitle>
              <CardDescription className="text-slate-400">
                Configure labels and choose which fields are required on the form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-200">Tags field</p>
                    <p className="text-xs text-slate-400">Require users to pick at least one tag.</p>
                  </div>
                  <Button
                    variant={requirements.tagsRequired ? "default" : "outline"}
                    className={requirements.tagsRequired ? "bg-violet-600 hover:bg-violet-500" : "border-slate-600 text-slate-300"}
                    onClick={() =>
                      setRequirements((prev) => ({ ...prev, tagsRequired: !prev.tagsRequired }))
                    }
                  >
                    {requirements.tagsRequired ? "Required" : "Optional"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-200">Comment field</p>
                    <p className="text-xs text-slate-400">Require users to include a written comment.</p>
                  </div>
                  <Button
                    variant={requirements.commentRequired ? "default" : "outline"}
                    className={requirements.commentRequired ? "bg-violet-600 hover:bg-violet-500" : "border-slate-600 text-slate-300"}
                    onClick={() =>
                      setRequirements((prev) => ({
                        ...prev,
                        commentRequired: !prev.commentRequired,
                      }))
                    }
                  >
                    {requirements.commentRequired ? "Required" : "Optional"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="cursor-pointer border-slate-600 text-slate-300 hover:border-red-500"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  >
                    #{t} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button variant="outline" onClick={addTag} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Add
                </Button>
              </div>
              <Separator className="bg-slate-700" />
              {error && (
                <div className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("categories")} className="text-slate-400">
                  ← Back
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-500"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? editing
                      ? "Saving…"
                      : "Creating…"
                    : editing
                      ? "Save changes →"
                      : "Create form →"}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === "done" && done && (
          <>
            <CardHeader>
              <div className="text-2xl mb-1">🎉</div>
              <CardTitle className="text-xl">
                {editing ? "Changes saved" : "Your form is ready"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {editing
                  ? "Your form and dashboard links are unchanged. Copy the embed code again if you need it."
                  : "Copy the embed code below and paste it anywhere on your site."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-800 p-3 text-xs text-slate-300 font-mono break-all border border-slate-700">
                {embedCode}
              </div>
              <Button className="w-full bg-violet-600 hover:bg-violet-500" onClick={copyEmbed}>
                {copied ? "Copied!" : "Copy embed code"}
              </Button>
              <Separator className="bg-slate-700" />
              <div className="flex flex-col gap-2">
                <a href={`/form/${done.projectId}?sid=${done.spreadsheetId}&preview=1`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Preview form
                  </Button>
                </a>
                <a href={`/dashboard/${done.projectId}?sid=${done.spreadsheetId}`}>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Go to dashboard →
                  </Button>
                </a>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
