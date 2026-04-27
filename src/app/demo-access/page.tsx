import { redirect } from "next/navigation"
import { Suspense } from "react"
import { demoGateEnabled } from "@/lib/demo-gate"
import DemoAccessForm from "./demo-access-form"

function DemoAccessFallback() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
      Loading…
    </div>
  )
}

export default function DemoAccessPage() {
  if (!demoGateEnabled()) {
    redirect("/")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Demo deployment
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Enter demo access</h1>
          <p className="text-sm text-slate-400">
            This preview is gated. Sign in with the demo credentials, then continue with Google as
            usual.
          </p>
        </div>
        <Suspense fallback={<DemoAccessFallback />}>
          <DemoAccessForm />
        </Suspense>
      </div>
    </main>
  )
}
