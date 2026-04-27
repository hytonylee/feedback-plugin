"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { ProjectCardActions } from "@/components/project-card-actions"
import { RemoveProjectButton } from "@/components/remove-project-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ProjectFilterMeta = {
  projectId: string
  categoriesInFeedback: string[]
  tagsInFeedback: string[]
}

type ProjectRow = {
  projectId: string
  projectName: string
  description: string
  spreadsheetId: string
}

type FilterMode = "all" | "category" | "tag"

type Props = {
  projects: ProjectRow[]
  filterMeta: ProjectFilterMeta[]
  allCategories: string[]
  allTags: string[]
  /** False when Sheets quota blocked feedback fetch — only "Show all" is meaningful. */
  filterDataAvailable: boolean
}

export function ProjectsSection({
  projects,
  filterMeta,
  allCategories,
  allTags,
  filterDataAvailable,
}: Props) {
  const [mode, setMode] = useState<FilterMode>("all")
  const [category, setCategory] = useState<string>(() => allCategories[0] ?? "")
  const [tag, setTag] = useState<string>(() => allTags[0] ?? "")

  const metaById = useMemo(
    () => new Map(filterMeta.map((m) => [m.projectId, m])),
    [filterMeta]
  )

  /** Keeps selection valid when option lists change — no sync effect needed. */
  const effectiveCategory = useMemo(() => {
    if (allCategories.length === 0) return ""
    return allCategories.includes(category) ? category : allCategories[0]
  }, [category, allCategories])

  const effectiveTag = useMemo(() => {
    if (allTags.length === 0) return ""
    return allTags.includes(tag) ? tag : allTags[0]
  }, [tag, allTags])

  const visible = useMemo(() => {
    if (mode === "all" || !filterDataAvailable) return projects
    if (mode === "category") {
      if (!effectiveCategory || allCategories.length === 0) return projects
      return projects.filter((p) =>
        (metaById.get(p.projectId)?.categoriesInFeedback ?? []).includes(effectiveCategory)
      )
    }
    if (mode === "tag") {
      if (!effectiveTag || allTags.length === 0) return projects
      return projects.filter((p) =>
        (metaById.get(p.projectId)?.tagsInFeedback ?? []).includes(effectiveTag)
      )
    }
    return projects
  }, [
    mode,
    effectiveCategory,
    effectiveTag,
    projects,
    metaById,
    filterDataAvailable,
    allCategories.length,
    allTags.length,
  ])

  const categoryFilterEnabled =
    filterDataAvailable && allCategories.length > 0
  const tagFilterEnabled = filterDataAvailable && allTags.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "all" ? "default" : "outline"}
            size="sm"
            className={
              mode === "all"
                ? "bg-primary hover:bg-secondary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary hover:text-primary-foreground"
            }
            onClick={() => setMode("all")}
          >
            Show all
          </Button>
          <Button
            type="button"
            variant={mode === "category" ? "default" : "outline"}
            size="sm"
            disabled={!categoryFilterEnabled}
            title={
              !filterDataAvailable
                ? "Load portfolio stats to filter by category"
                : allCategories.length === 0
                  ? "No categories in feedback yet"
                  : undefined
            }
            className={
              mode === "category"
                ? "bg-primary hover:bg-secondary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary hover:text-primary-foreground"
            }
            onClick={() => setMode("category")}
          >
            Categories
          </Button>
          <Button
            type="button"
            variant={mode === "tag" ? "default" : "outline"}
            size="sm"
            disabled={!tagFilterEnabled}
            title={
              !filterDataAvailable
                ? "Load portfolio stats to filter by tag"
                : allTags.length === 0
                  ? "No tags in feedback yet"
                  : undefined
            }
            className={
              mode === "tag"
                ? "bg-primary hover:bg-secondary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary hover:text-primary-foreground"
            }
            onClick={() => setMode("tag")}
          >
            Tags
          </Button>
        </div>

        {mode === "category" && categoryFilterEnabled ? (
          <div className="flex min-w-48 flex-1 flex-row flex-wrap items-center gap-2 sm:max-w-xs sm:flex-none">
            <span className="shrink-0 text-xs text-muted-foreground">Category</span>
            <div className="min-w-0 flex-1">
              <Select value={effectiveCategory} onValueChange={(v: string | null) => setCategory(v ?? "")}>
                <SelectTrigger
                  size="sm"
                  className="w-full border-border bg-background text-foreground"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border border-border bg-card">
                  {allCategories.map((c) => (
                    <SelectItem key={c} value={c} className="text-foreground focus:bg-background">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {mode === "tag" && tagFilterEnabled ? (
          <div className="flex min-w-48 flex-1 flex-row flex-wrap items-center gap-2 sm:max-w-xs sm:flex-none">
            <span className="shrink-0 text-xs text-muted-foreground">Tag</span>
            <div className="min-w-0 flex-1">
              <Select value={effectiveTag} onValueChange={(v: string | null) => setTag(v ?? "")}>
                <SelectTrigger
                  size="sm"
                  className="w-full border-border bg-background text-foreground"
                >
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent className="border border-border bg-card">
                  {allTags.map((t) => (
                    <SelectItem key={t} value={t} className="text-foreground focus:bg-background">
                      #{t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <Card className="border border-border bg-card text-foreground">
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No projects match this filter. Try another category or tag, or choose Show all.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => {
            const sid = project.spreadsheetId
            return (
              <Card
                key={project.projectId}
                className="border border-border bg-card text-foreground h-full"
              >
                <CardHeader className="pb-2 space-y-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-lg">{project.projectName}</CardTitle>
                      {project.description.trim() ? (
                        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                          {project.description}
                        </p>
                      ) : null}
                      <CardDescription className="text-muted-foreground">
                        projectId: <span className="font-mono">{project.projectId}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Link
                        href={`/setup?pid=${encodeURIComponent(project.projectId)}&sid=${encodeURIComponent(sid)}`}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-border bg-background text-foreground hover:bg-secondary hover:text-primary-foreground"
                        >
                          Edit form
                        </Button>
                      </Link>
                      <RemoveProjectButton
                        projectId={project.projectId}
                        spreadsheetId={sid}
                        projectName={project.projectName}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex flex-1 flex-col justify-end">
                  <ProjectCardActions projectId={project.projectId} spreadsheetId={sid} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
