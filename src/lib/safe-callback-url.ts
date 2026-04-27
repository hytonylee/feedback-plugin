/** Same-origin relative path safe for Auth.js redirectTo / callbackUrl. */
export function safeCallbackPath(callbackUrl: string | undefined): string {
  const raw =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/"
  return raw === "/login" ? "/" : raw
}
