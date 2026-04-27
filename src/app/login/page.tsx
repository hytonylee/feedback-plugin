import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { signInWithGoogle } from "./actions"
import { safeCallbackPath } from "@/lib/safe-callback-url"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth()
  const { callbackUrl } = await searchParams

  if (session) {
    redirect(safeCallbackPath(callbackUrl))
  }

  const safeCallback = safeCallbackPath(callbackUrl)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-[#FFD45A] to-[#FFA95A] p-8 text-[#2B1F0E]">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[#2B1F0E]/60">
            Sign in
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Continue with Google
          </h1>
          <p className="text-sm text-[#2B1F0E]/75">
            Sign in to create feedback forms, manage projects, and open dashboards.
          </p>
        </div>
        <form action={signInWithGoogle}>
          <input type="hidden" name="callbackUrl" value={safeCallback} />
          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#FF5A5A] hover:bg-[#FF8B5A] text-[#2B1F0E]"
          >
            Sign in with Google
          </Button>
        </form>
        <p className="text-xs text-[#2B1F0E]/60">
          Public feedback links ({"/form/…"}) stay shareable; this sign-in is for the
          builder console only.
        </p>
      </div>
    </main>
  )
}
