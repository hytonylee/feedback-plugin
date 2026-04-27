"use client"

import Link from "next/link"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"

const outlineCard =
  "border-slate-500 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"

type Props = {
  projectId: string
  spreadsheetId: string
}

export function ProjectCardActions({ projectId, spreadsheetId }: Props) {
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const formHref = `/form/${projectId}?sid=${spreadsheetId}`
  const dashboardHref = `/dashboard/${projectId}?sid=${spreadsheetId}`

  const copyEmbedScript = useCallback(() => {
    const origin = window.location.origin
    const embed = `<iframe src="${origin}${formHref}" width="100%" height="520" frameborder="0" style="border-radius:12px"></iframe>`
    void navigator.clipboard.writeText(embed)
    setCopiedEmbed(true)
    setTimeout(() => setCopiedEmbed(false), 2000)
  }, [formHref])

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={outlineCard}
        onClick={copyEmbedScript}
      >
        {copiedEmbed ? "Copied!" : "Copy embed script"}
      </Button>
      <Button variant="outline" size="sm" className={outlineCard} nativeButton={false} render={<Link href={formHref} target="_blank" rel="noopener noreferrer" />}>
        Form preview
      </Button>
      <Button variant="outline" size="sm" className={outlineCard} nativeButton={false} render={<Link href={dashboardHref} />}>
        Dashboard
      </Button>
    </div>
  )
}
