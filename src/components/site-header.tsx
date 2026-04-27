import Link from "next/link"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const navLinkClass =
  "text-sm font-medium text-slate-300 hover:text-white transition-colors"

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-white">
            Feedback
          </Link>
          <Link href="/" className={navLinkClass}>
            Home
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
            className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Log out
          </Button>
        </form>
      </div>
    </header>
  )
}
