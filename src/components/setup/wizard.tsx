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

export default function SetupWizard({
  editProjectId,
  editSpreadsheetId,
}: SetupWizardProps) {
  const isEditMode = Boolean(editProjectId && editSpreadsheetId)

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg border border-border bg-card text-foreground">
        {step === "name" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                {isEditMode ? "Edit project" : "Name your project"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isEditMode
                  ? "Rename your project or continue to update categories and tags."
                  : "This is what your team will see on the dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Project name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme App v2 Feedback"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && projectName && setStep("categories")}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-secondary text-primary-foreground"
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
              <CardTitle className="text-xl text-foreground">Feedback categories</CardTitle>
              <CardDescription className="text-muted-foreground">
                Users will pick one category per submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="cursor-pointer bg-background hover:bg-accent text-foreground"
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button variant="outline" onClick={addCategory} className="border-border text-foreground hover:bg-background">
                  Add
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("name")} className="text-muted-foreground">
                  ← Back
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-secondary text-primary-foreground"
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
              <CardTitle className="text-xl text-foreground">Tags</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure labels and choose which fields are required on the form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/80 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground">Tags field</p>
                    <p className="text-xs text-muted-foreground">Require users to pick at least one tag.</p>
                  </div>
                  <Button
                    variant={requirements.tagsRequired ? "default" : "outline"}
                    className={requirements.tagsRequired ? "bg-primary hover:bg-secondary text-primary-foreground" : "border-border text-foreground hover:bg-background"}
                    onClick={() =>
                      setRequirements((prev) => ({ ...prev, tagsRequired: !prev.tagsRequired }))
                    }
                  >
                    {requirements.tagsRequired ? "Required" : "Optional"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground">Comment field</p>
                    <p className="text-xs text-muted-foreground">Require users to include a written comment.</p>
                  </div>
                  <Button
                    variant={requirements.commentRequired ? "default" : "outline"}
                    className={requirements.commentRequired ? "bg-primary hover:bg-secondary text-primary-foreground" : "border-border text-foreground hover:bg-background"}
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
                    className="cursor-pointer border-border text-foreground hover:border-primary"
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button variant="outline" onClick={addTag} className="border-border text-foreground hover:bg-background">
                  Add
                </Button>
              </div>
              <Separator className="bg-border" />
              {error && (
                <div className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("categories")} className="text-muted-foreground">
                  ← Back
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-secondary text-primary-foreground"
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
              <CardTitle className="text-xl text-foreground">Your form is ready</CardTitle>
              <CardDescription className="text-muted-foreground">
                Copy the embed code below and paste it anywhere on your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-background p-3 text-xs text-foreground font-mono break-all border border-border">
                {embedCode}
              </div>
              <Button className="w-full bg-primary hover:bg-secondary text-primary-foreground" onClick={copyEmbed}>
                {copied ? "Copied!" : "Copy embed code"}
              </Button>
              <Separator className="bg-border" />
              <div className="flex flex-col gap-2">
                <a href={`/form/${done.projectId}?sid=${done.spreadsheetId}&preview=1`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full border-border text-foreground hover:bg-background">
                    Preview form
                  </Button>
                </a>
                <a href={`/dashboard/${done.projectId}?sid=${done.spreadsheetId}`}>
                  <Button variant="outline" className="w-full border-border text-foreground hover:bg-background">
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
