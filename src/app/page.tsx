import Link from "next/link"
import { auth, signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-[#FFD45A] to-[#FFA95A] p-8 text-[#2B1F0E]">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FF8B5A]/35 px-4 py-1.5 text-sm font-medium text-[#2B1F0E] border border-[#FF8B5A]/60">
          Product Feedback, Simplified
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Understand what your users{" "}
          <span className="bg-linear-to-r from-[#FF5A5A] to-[#FF8B5A] bg-clip-text text-transparent">
            really want
          </span>
        </h1>
        <p className="text-lg text-[#2B1F0E]/75 max-w-lg mx-auto">
          Collect structured feedback, auto-sync to Google Sheets, and instantly see
          what your team should build next.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          {session ? (
            <>
              <Link href="/setup">
                <Button size="lg" className="bg-[#FF5A5A] hover:bg-[#FF8B5A] text-[#2B1F0E]">
                  Generate your feedback form →
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#FF8B5A] bg-[#FFA95A] text-[#2B1F0E] hover:bg-[#FF8B5A] hover:text-[#2B1F0E]"
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
                className="bg-[#FF5A5A] hover:bg-[#FF8B5A] text-[#2B1F0E]"
              >
                Get started with Google
              </Button>
            </form>
          )}
        </div>
        <p className="text-xs text-[#2B1F0E]/60">
          No spreadsheet setup. No code required.
        </p>
      </div>
    </main>
  )
}
