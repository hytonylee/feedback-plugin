import Link from "next/link"
import { auth, signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2B1F0E] to-[#40331C] p-8 text-[#D9CCB4]">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#D9CCB4]/10 px-4 py-1.5 text-sm font-medium text-[#D9CCB4] border border-[#D9CCB4]/10">
          Product Feedback, Simplified
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Understand what your users{" "}
          <span className="bg-gradient-to-r from-[#D9A76A] to-[#D9CCB4] bg-clip-text text-transparent">
            really want
          </span>
        </h1>
        <p className="text-lg text-[#A5A6A4] max-w-lg mx-auto">
          Collect structured feedback, auto-sync to Google Sheets, and instantly see
          what your team should build next.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          {session ? (
            <>
              <Link href="/setup">
                <Button size="lg" className="bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]">
                  Create your feedback form →
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#7A5D30] bg-[#40331C] text-[#D9CCB4] hover:bg-[#4A3518] hover:text-[#D9CCB4]"
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
                className="bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]"
              >
                Get started with Google
              </Button>
            </form>
          )}
        </div>
        <p className="text-xs text-[#7A7A78]">
          No spreadsheet setup. No code required.
        </p>
      </div>
    </main>
  )
}
