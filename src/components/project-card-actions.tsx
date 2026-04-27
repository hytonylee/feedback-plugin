"use client"

import Link from "next/link"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"

const outlineCard =
  "border-border bg-background text-foreground hover:bg-secondary hover:text-primary-foreground"

type Props = {
  projectId: string
  spreadsheetId: string
}

export function ProjectCardActions({ projectId, spreadsheetId }: Props) {
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [copiedDistributionLink, setCopiedDistributionLink] = useState(false)

  const formHref = `/form/${projectId}?sid=${spreadsheetId}`
  const previewFormHref = `${formHref}&preview=1`
  const dashboardHref = `/dashboard/${projectId}?sid=${spreadsheetId}`

  const copyEmbedScript = useCallback(() => {
    const origin = window.location.origin
    const embed = `<iframe src="${origin}${formHref}" width="100%" height="520" frameborder="0" style="border-radius:12px"></iframe>`
    void navigator.clipboard.writeText(embed)
    setCopiedEmbed(true)
    setTimeout(() => setCopiedEmbed(false), 2000)
  }, [formHref])

  const copyDistributionLink = useCallback(() => {
    const origin = window.location.origin
    // Public form URL (same as embed iframe src) — submissions are saved; not preview mode
    void navigator.clipboard.writeText(`${origin}${formHref}`)
    setCopiedDistributionLink(true)
    setTimeout(() => setCopiedDistributionLink(false), 2000)
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={outlineCard}
        onClick={copyDistributionLink}
        title="Copy the public form URL to share with respondents (same as the embed form; submissions are saved)"
      >
        {copiedDistributionLink ? "Copied!" : "Copy distribution link"}
      </Button>
      <Button variant="outline" size="sm" className={outlineCard} nativeButton={false} render={<Link href={previewFormHref} target="_blank" rel="noopener noreferrer" />}>
        Form preview
      </Button>
      <Button variant="outline" size="sm" className={outlineCard} nativeButton={false} render={<Link href={dashboardHref} />}>
        Form dashboard
      </Button>
    </div>
  )
}
