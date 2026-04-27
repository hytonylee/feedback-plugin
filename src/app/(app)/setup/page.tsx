import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SetupWizard from "@/components/setup/wizard"

export default async function SetupPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return <SetupWizard />
}
