"use server"

import { signIn } from "@/lib/auth"
import { safeCallbackPath } from "@/lib/safe-callback-url"

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = safeCallbackPath(
    typeof formData.get("callbackUrl") === "string"
      ? (formData.get("callbackUrl") as string)
      : undefined
  )
  await signIn("google", { redirectTo: callbackUrl })
}
