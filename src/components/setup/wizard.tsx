"use client"

import { useState } from "react"
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

interface SetupWizardProps {
  editProjectId?: string
  editSpreadsheetId?: string
}

export default function SetupWizard(_props: SetupWizardProps) {
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

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
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

  return (
    <div className="min-h-screen bg-[#2B1F0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
        {step === "name" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl text-[#D9CCB4]">Name your project</CardTitle>
              <CardDescription className="text-[#A5A6A4]">
                This is what your team will see on the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#C4B898]">Project name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme App v2 Feedback"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && projectName && setStep("categories")}
                  className="bg-[#4A3518] border-[#7A5D30] text-[#D9CCB4] placeholder:text-[#7A7A78]"
                />
              </div>
              <Button
                className="w-full bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]"
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
              <CardTitle className="text-xl text-[#D9CCB4]">Feedback categories</CardTitle>
              <CardDescription className="text-[#A5A6A4]">
                Users will pick one category per submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="cursor-pointer bg-[#4A3518] hover:bg-red-900/50 text-[#C4B898]"
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
                  className="bg-[#4A3518] border-[#7A5D30] text-[#D9CCB4] placeholder:text-[#7A7A78]"
                />
                <Button variant="outline" onClick={addCategory} className="border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518]">
                  Add
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("name")} className="text-[#A5A6A4]">
                  ← Back
                </Button>
                <Button
                  className="flex-1 bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]"
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
              <CardTitle className="text-xl text-[#D9CCB4]">Tags</CardTitle>
              <CardDescription className="text-[#A5A6A4]">
                Configure labels and choose which fields are required on the form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-[#5C4520] bg-[#4A3518]/60 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#C4B898]">Tags field</p>
                    <p className="text-xs text-[#A5A6A4]">Require users to pick at least one tag.</p>
                  </div>
                  <Button
                    variant={requirements.tagsRequired ? "default" : "outline"}
                    className={requirements.tagsRequired ? "bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]" : "border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518]"}
                    onClick={() =>
                      setRequirements((prev) => ({ ...prev, tagsRequired: !prev.tagsRequired }))
                    }
                  >
                    {requirements.tagsRequired ? "Required" : "Optional"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#C4B898]">Comment field</p>
                    <p className="text-xs text-[#A5A6A4]">Require users to include a written comment.</p>
                  </div>
                  <Button
                    variant={requirements.commentRequired ? "default" : "outline"}
                    className={requirements.commentRequired ? "bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]" : "border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518]"}
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
                    className="cursor-pointer border-[#7A5D30] text-[#C4B898] hover:border-red-500"
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
                  className="bg-[#4A3518] border-[#7A5D30] text-[#D9CCB4] placeholder:text-[#7A7A78]"
                />
                <Button variant="outline" onClick={addTag} className="border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518]">
                  Add
                </Button>
              </div>
              <Separator className="bg-[#5C4520]" />
              {error && (
                <div className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("categories")} className="text-[#A5A6A4]">
                  ← Back
                </Button>
                <Button
                  className="flex-1 bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "Creating…" : "Create form →"}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === "done" && done && (
          <>
            <CardHeader>
              <div className="text-2xl mb-1">🎉</div>
              <CardTitle className="text-xl text-[#D9CCB4]">Your form is ready</CardTitle>
              <CardDescription className="text-[#A5A6A4]">
                Copy the embed code below and paste it anywhere on your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-[#4A3518] p-3 text-xs text-[#C4B898] font-mono break-all border border-[#5C4520]">
                {embedCode}
              </div>
              <Button className="w-full bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]" onClick={copyEmbed}>
                {copied ? "Copied!" : "Copy embed code"}
              </Button>
              <Separator className="bg-[#5C4520]" />
              <div className="flex flex-col gap-2">
                <a href={`/form/${done.projectId}?sid=${done.spreadsheetId}&preview=1`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518]">
                    Preview form
                  </Button>
                </a>
                <a href={`/dashboard/${done.projectId}?sid=${done.spreadsheetId}`}>
                  <Button variant="outline" className="w-full border-[#7A5D30] text-[#C4B898] hover:bg-[#4A3518]">
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
