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
        <Label htmlFor="demo-user" className="flex w-full justify-center text-slate-300">
          Demo username
        </Label>
        <Input
          id="demo-user"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="box-border w-full min-w-0 max-w-full bg-slate-800 border-slate-600 text-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="demo-pass" className="flex w-full justify-center text-slate-300">
          Demo password
        </Label>
        <Input
          id="demo-pass"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="box-border w-full min-w-0 max-w-full bg-slate-800 border-slate-600 text-white"
          required
        />
      </div>
      {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
      <Button
        type="submit"
        className="box-border w-full min-w-0 max-w-full bg-violet-600 hover:bg-violet-500 text-white"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Continue to app"}
      </Button>
    </form>
  )
}
