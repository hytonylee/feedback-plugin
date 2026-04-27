import Link from "next/link"
import { auth, signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-linear-to-br from-background to-card p-8 text-foreground">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/35 px-4 py-1.5 text-sm font-medium text-foreground border border-secondary/60">
          Product Feedback, Simplified
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Understand what your users{" "}
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            really want
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Collect structured feedback, auto-sync to Google Sheets, and instantly see
          what your team should build next.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          {session ? (
            <>
              <Link href="/setup">
                <Button size="lg" className="bg-primary hover:bg-secondary text-primary-foreground">
                  Generate your feedback form →
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border bg-card text-foreground hover:bg-secondary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
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
                className="bg-primary hover:bg-secondary text-primary-foreground"
              >
                Get started with Google
              </Button>
            </form>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          No spreadsheet setup. No code required.
        </p>
      </div>
    </main>
  )
}
