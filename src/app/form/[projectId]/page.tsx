import { notFound } from "next/navigation"
import FeedbackForm from "@/components/form/feedback-form"

interface Props {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ sid?: string; preview?: string }>
}

export default async function FormPage({ params, searchParams }: Props) {
  const { projectId } = await params
  const { sid: spreadsheetId, preview } = await searchParams

  if (!spreadsheetId) notFound()

  const isPreview = preview === "1"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FeedbackForm
        key={`${projectId}-${spreadsheetId}-${isPreview ? "p" : "live"}`}
        projectId={projectId}
        spreadsheetId={spreadsheetId}
        preview={isPreview}
        dashboardUrl={isPreview ? `/dashboard/${projectId}?sid=${spreadsheetId}` : undefined}
      />
    </div>
  )
}
