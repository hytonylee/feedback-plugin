import { notFound } from "next/navigation"
import FeedbackForm from "@/components/form/feedback-form"

interface Props {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ sid?: string }>
}

export default async function FormPage({ params, searchParams }: Props) {
  const { projectId } = await params
  const { sid: spreadsheetId } = await searchParams

  if (!spreadsheetId) notFound()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <FeedbackForm projectId={projectId} spreadsheetId={spreadsheetId} />
    </div>
  )
}
