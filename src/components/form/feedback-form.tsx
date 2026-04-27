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
  dashboardUrl?: string
}

export default function FeedbackForm({ projectId, spreadsheetId, preview = false, dashboardUrl }: Props) {
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
      <Card className="w-full max-w-md bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
        <CardContent className="py-12 text-center space-y-2">
          <p className="font-medium text-[#D9CCB4]">Unable to load this form</p>
          <p className="text-sm text-[#A5A6A4]">Please confirm you are signed in and try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!project) {
    return (
      <Card className="w-full max-w-md bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
        <CardContent className="py-12 text-center text-[#A5A6A4]">Loading…</CardContent>
      </Card>
    )
  }

  if (status === "done") {
    return (
      <Card className="w-full max-w-md bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
        <CardContent className="py-12 text-center space-y-2">
          <div className="text-3xl">✓</div>
          <p className="font-medium text-[#D9CCB4]">{preview ? "Preview looks great!" : "Feedback received!"}</p>
          <p className="text-sm text-[#A5A6A4]">
            {preview ? "This was a preview — no data was saved." : "Thanks for helping us improve."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
      {preview && (
        <div className="rounded-t-lg bg-[#D9A76A]/10 border-b border-[#D9A76A]/30 px-4 py-2 flex items-center justify-between gap-2 text-xs text-[#D9A76A]">
          <span>Preview mode — submissions will not be saved</span>
          {dashboardUrl && (
            <a href={dashboardUrl} className="underline underline-offset-2 whitespace-nowrap hover:text-[#E5BF8E]">
              ← Dashboard
            </a>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg text-[#D9CCB4]">{project.projectName}</CardTitle>
        <CardDescription className="text-[#A5A6A4]">Share your feedback with the team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[#C4B898]">Category</Label>
          <Select onValueChange={(v: string | null) => setCategory(v ?? "")}>
            <SelectTrigger className="bg-[#4A3518] border-[#7A5D30] text-[#D9CCB4]">
              <SelectValue placeholder="What type of feedback?" />
            </SelectTrigger>
            <SelectContent className="bg-[#40331C] border-[#5C4520]">
              {project.categories.map((c) => (
                <SelectItem key={c} value={c} className="text-[#D9CCB4] focus:bg-[#4A3518]">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {project.tags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[#C4B898]">
              Tags{" "}
              <span className="text-[#7A7A78] font-normal">
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
                      ? "bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4] border-[#733906]"
                      : "border-[#7A5D30] text-[#A5A6A4] hover:border-[#D9A76A]"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            {project.requirements.tagsRequired && selectedTags.length === 0 && (
              <p className="text-xs text-[#D9A76A]">Select at least one tag.</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-[#C4B898]">
            Comment{" "}
            <span className="text-[#7A7A78] font-normal">
              ({project.requirements.commentRequired ? "required" : "optional"})
            </span>
          </Label>
          <Textarea
            placeholder="Tell us more…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-[#4A3518] border-[#7A5D30] text-[#D9CCB4] placeholder:text-[#7A7A78] resize-none"
            rows={3}
          />
          {project.requirements.commentRequired && !comment.trim() && (
            <p className="text-xs text-[#D9A76A]">Comment is required.</p>
          )}
        </div>

        <Button
          className="w-full bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]"
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
