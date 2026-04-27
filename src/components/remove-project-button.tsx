"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type Props = {
  projectId: string
  spreadsheetId: string
  projectName: string
}

export function RemoveProjectButton({ projectId, spreadsheetId, projectName }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleRemove() {
    const ok = window.confirm(
      `Remove "${projectName}"?\n\nThe feedback spreadsheet will be moved to your Google Drive trash. Form and dashboard links will stop working.`
    )
    if (!ok) return

    setPending(true)
    try {
      const res = await fetch(
        `/api/project/${encodeURIComponent(projectId)}?sid=${encodeURIComponent(spreadsheetId)}`,
        { method: "DELETE" }
      )
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        alert(data.error ?? "Could not remove project. Try again.")
        return
      }
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={handleRemove}
      className="shrink-0"
    >
      {pending ? "Removing…" : "Remove"}
    </Button>
  )
}
