"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Project } from "@/types"

interface Props {
  projectId: string
  spreadsheetId: string
  preview?: boolean
}

export default function FeedbackForm({ projectId, spreadsheetId, preview = false }: Props) {
  const [project, setProject] = useState<Project | null>(null)
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const isTagsValid = !project?.requirements?.tagsRequired || selectedTags.length > 0
  const isCommentValid = !project?.requirements?.commentRequired || comment.trim().length > 0
  const canSubmit = Boolean(category) && isTagsValid && isCommentValid && status !== "loading"

  useEffect(() => {
    fetch(`/api/project/${projectId}?sid=${spreadsheetId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load project")
        return r.json()
      })
      .then(setProject)
      .catch(() => setStatus("error"))
  }, [projectId, spreadsheetId])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!project || !canSubmit) return
    if (preview) {
      setStatus("done")
      return
    }
    setStatus("loading")
    const res = await fetch(`/api/feedback/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        tags: selectedTags,
        comment,
        spreadsheetId,
      }),
    })
    setStatus(res.ok ? "done" : "error")
  }

  if (status === "error" && !project) {
    return (
      <Card className="w-full max-w-md bg-slate-900 border-slate-700 text-white">
        <CardContent className="py-12 text-center space-y-2">
          <p className="font-medium text-white">Unable to load this form</p>
          <p className="text-sm text-slate-400">Please confirm you are signed in and try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!project) {
    return (
      <Card className="w-full max-w-md bg-slate-900 border-slate-700 text-white">
        <CardContent className="py-12 text-center text-slate-400">Loading…</CardContent>
      </Card>
    )
  }

  if (status === "done") {
    return (
      <Card className="w-full max-w-md bg-slate-900 border-slate-700 text-white">
        <CardContent className="py-12 text-center space-y-2">
          <div className="text-3xl">✓</div>
          <p className="font-medium text-white">{preview ? "Preview looks great!" : "Feedback received!"}</p>
          <p className="text-sm text-slate-400">
            {preview ? "This was a preview — no data was saved." : "Thanks for helping us improve."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-slate-900 border-slate-700 text-white">
      {preview && (
        <div className="rounded-t-lg bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300">
          Preview mode — submissions will not be saved
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{project.projectName}</CardTitle>
        <CardDescription className="text-slate-400">Share your feedback with the team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-300">Category</Label>
          <Select onValueChange={(v: string | null) => setCategory(v ?? "")}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="What type of feedback?" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {project.categories.map((c) => (
                <SelectItem key={c} value={c} className="text-white focus:bg-slate-700">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {project.tags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-slate-300">
              Tags{" "}
              <span className="text-slate-500 font-normal">
                ({project.requirements.tagsRequired ? "required" : "optional"})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-violet-600 hover:bg-violet-500 text-white border-violet-600"
                      : "border-slate-600 text-slate-400 hover:border-violet-500"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            {project.requirements.tagsRequired && selectedTags.length === 0 && (
              <p className="text-xs text-amber-300">Select at least one tag.</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-slate-300">
            Comment{" "}
            <span className="text-slate-500 font-normal">
              ({project.requirements.commentRequired ? "required" : "optional"})
            </span>
          </Label>
          <Textarea
            placeholder="Tell us more…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
            rows={3}
          />
          {project.requirements.commentRequired && !comment.trim() && (
            <p className="text-xs text-amber-300">Comment is required.</p>
          )}
        </div>

        <Button
          className="w-full bg-violet-600 hover:bg-violet-500 text-white"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {status === "loading" ? "Submitting…" : "Submit feedback"}
        </Button>

        {status === "error" && (
          <p className="text-xs text-red-400 text-center">Something went wrong. Please try again.</p>
        )}
      </CardContent>
    </Card>
  )
}
