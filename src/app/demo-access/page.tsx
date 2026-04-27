import { redirect } from "next/navigation"
import { Suspense } from "react"
import { demoGateEnabled } from "@/lib/demo-gate"
import DemoAccessForm from "./demo-access-form"

function DemoAccessFallback() {
  return (
    <div className="mx-auto w-full min-w-0 rounded-xl border border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
      Loading…
    </div>
  )
}

export default function DemoAccessPage() {
  if (!demoGateEnabled()) {
    redirect("/login")
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-linear-to-br from-slate-950 to-slate-800 px-4 py-12 text-white sm:px-8">
      {/* One column: same max width for headline, copy, and form (inputs match text block). */}
      <div className="mx-auto flex w-full min-w-0 max-w-sm flex-col items-center gap-8 text-center">
        <div className="w-full min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Demo deployment
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Enter demo access</h1>
          <p className="text-sm text-balance text-slate-400">
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
