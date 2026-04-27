import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SetupWizard from "@/components/setup/wizard"

type Props = {
  searchParams: Promise<{ pid?: string; sid?: string }>
}

export default async function SetupPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/login")
  const { pid, sid } = await searchParams
  const editProjectId = pid && sid ? pid : undefined
  const editSpreadsheetId = pid && sid ? sid : undefined
  return (
    <SetupWizard editProjectId={editProjectId} editSpreadsheetId={editSpreadsheetId} />
  )
}
