"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DemoAccessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallback = searchParams.get("callbackUrl") || "/"
  const callbackUrl =
    rawCallback.startsWith("/") &&
    !rawCallback.startsWith("//") &&
    !rawCallback.includes("\\")
      ? rawCallback
      : "/"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/demo-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "Sign-in failed")
        setPending(false)
        return
      }
      router.replace(callbackUrl.startsWith("/") ? callbackUrl : "/")
      router.refresh()
    } catch {
      setError("Something went wrong")
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full min-w-0 max-w-full space-y-6 text-center"
    >
      <div className="space-y-2">
        <Label htmlFor="demo-user" className="flex w-full justify-center text-[#2B1F0E]/85">
          Demo username
        </Label>
        <Input
          id="demo-user"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="box-border w-full min-w-0 max-w-full bg-[#FFD45A] border-[#FF8B5A] text-[#2B1F0E]"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="demo-pass" className="flex w-full justify-center text-[#2B1F0E]/85">
          Demo password
        </Label>
        <Input
          id="demo-pass"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="box-border w-full min-w-0 max-w-full bg-[#FFD45A] border-[#FF8B5A] text-[#2B1F0E]"
          required
        />
      </div>
      {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
      <Button
        type="submit"
        className="box-border w-full min-w-0 max-w-full bg-[#FF5A5A] hover:bg-[#FF8B5A] text-[#2B1F0E]"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Continue to app"}
      </Button>
    </form>
  )
}
