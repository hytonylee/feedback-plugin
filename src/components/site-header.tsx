import Link from "next/link"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const navLinkClass =
  "text-sm font-medium text-[#2B1F0E]/80 hover:text-[#2B1F0E] transition-colors"

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#FF5A5A]/60 bg-[#FF8B5A]/95 backdrop-blur supports-backdrop-filter:bg-[#FF8B5A]/88">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-[#2B1F0E]">
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
            className="border-[#FF8B5A] bg-[#FFA95A] text-[#2B1F0E] hover:bg-[#FF8B5A] hover:text-[#2B1F0E]"
          >
            Log out
          </Button>
        </form>
      </div>
    </header>
  )
}
