const GATE_COOKIE = "feedback_demo_gate"
const GATE_PAYLOAD = "feedback-plugin-demo-gate-v1"

export function demoGateCookieName(): typeof GATE_COOKIE {
  return GATE_COOKIE
}

/** Username for demo gate (supports both env spellings). */
export function demoAccessUsername(): string {
  return (
    process.env.DEMO_ACCESS_USER?.trim() ||
    process.env.DEMO_ACCESS_USERNAME?.trim() ||
    ""
  )
}

/** Password for demo gate. */
export function demoAccessPassword(): string {
  return process.env.DEMO_ACCESS_PASSWORD?.trim() || ""
}

/** Signing secret for the demo cookie (supports both env spellings). */
function demoGateSigningSecret(): string {
  return (
    process.env.DEMO_GATE_SECRET?.trim() ||
    process.env.DEMO_ACCESS_SECRET?.trim() ||
    ""
  )
}

/** When username and password env vars are both set, the demo gate is active. */
export function demoGateEnabled(): boolean {
  const user = demoAccessUsername()
  const pass = demoAccessPassword()
  return Boolean(user && pass)
}

function signingMaterial(): string {
  const explicit = demoGateSigningSecret()
  if (explicit) return explicit
  const user = demoAccessUsername()
  const pass = demoAccessPassword()
  return `demo-gate:${user}:${pass}`
}

async function hmacSha256Hex(message: string, keyMaterial: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keyMaterial),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function expectedDemoGateToken(): Promise<string> {
  return hmacSha256Hex(GATE_PAYLOAD, signingMaterial())
}

export async function verifyDemoGateToken(token: string | undefined): Promise<boolean> {
  if (!token || !demoGateEnabled()) return false
  const expected = await expectedDemoGateToken()
  return timingSafeEqualHex(token, expected)
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/** Constant-time string compare for credential checks (demo only). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ba = enc.encode(a)
  const bb = enc.encode(b)
  if (ba.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i]
  return diff === 0
}

/**
 * Paths that stay public when the demo gate is on (embedded form + its APIs).
 */
export function isDemoGatePublicPath(pathname: string): boolean {
  if (pathname === "/demo-access") return true
  /** NextAuth OAuth + session endpoints must not be blocked by demo gate. */
  if (pathname.startsWith("/api/auth")) return true
  if (pathname.startsWith("/form/")) return true
  if (pathname.startsWith("/api/project/")) return true
  if (pathname.startsWith("/api/feedback/")) return true
  if (pathname.startsWith("/api/demo-access")) return true
  return false
}
