import { redirect } from "next/navigation"
import { Suspense } from "react"
import { demoGateEnabled } from "@/lib/demo-gate"
import DemoAccessForm from "./demo-access-form"

function DemoAccessFallback() {
  return (
    <div className="mx-auto w-full min-w-0 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
      Loading…
    </div>
  )
}

export default function DemoAccessPage() {
  if (!demoGateEnabled()) {
    redirect("/login")
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-linear-to-br from-background to-card px-4 py-12 text-foreground sm:px-8">
      {/* One column: same max width for headline, copy, and form (inputs match text block). */}
      <div className="mx-auto flex w-full min-w-0 max-w-sm flex-col items-center gap-8 text-center">
        <div className="w-full min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Demo deployment
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Enter demo access</h1>
          <p className="text-sm text-balance text-muted-foreground">
            This preview is gated. Sign in with the demo credentials, then continue with Google as
            usual.
          </p>
        </div>
        <div className="w-full min-w-0">
          <Suspense fallback={<DemoAccessFallback />}>
            <DemoAccessForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
