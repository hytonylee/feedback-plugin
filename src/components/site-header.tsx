import Link from "next/link"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const navLinkClass =
  "text-sm font-medium text-secondary-foreground/85 hover:text-primary-foreground transition-colors"

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/30 bg-secondary/95 backdrop-blur supports-backdrop-filter:bg-secondary/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-primary-foreground">
            📋 Feedback Plugin
          </Link>
          <Link href="/setup" className={navLinkClass}>
            Generate form
          </Link>
          <Link href="/projects" className={navLinkClass}>
            Dashboard
          </Link>
        </nav>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-secondary-foreground/35 bg-transparent text-secondary-foreground hover:bg-primary/25 hover:border-primary-foreground/40 hover:text-primary-foreground"
          >
            Log out
          </Button>
        </form>
      </div>
    </header>
  )
}
