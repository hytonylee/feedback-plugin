import Link from "next/link"
import { auth, signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-slate-300 border border-white/10">
          Product Feedback, Simplified
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Understand what your users{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            really want
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-lg mx-auto">
          Collect structured feedback, auto-sync to Google Sheets, and instantly see
          what your team should build next.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          {session ? (
            <>
              <Link href="/setup">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white">
                  Create your feedback form →
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-200 bg-slate-50 text-slate-950 hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  View all projects
                </Button>
              </Link>
            </>
          ) : (
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo: "/setup" })
              }}
            >
              <Button
                type="submit"
                size="lg"
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                Get started with Google
              </Button>
            </form>
          )}
        </div>
        <p className="text-xs text-slate-500">
          No spreadsheet setup. No code required.
        </p>
      </div>
    </main>
  )
}
