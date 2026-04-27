import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

type JWTLike = {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  error?: "RefreshAccessTokenError"
}

async function refreshGoogleAccessToken(token: JWTLike): Promise<JWTLike> {
  if (!token.refreshToken) return { ...token, error: "RefreshAccessTokenError" }

  const clientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return { ...token, error: "RefreshAccessTokenError" }
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    })

    const refreshed = (await response.json()) as {
      access_token?: string
      expires_in?: number
      refresh_token?: string
      error?: string
    }

    if (!response.ok || !refreshed.access_token || !refreshed.expires_in) {
      return { ...token, error: "RefreshAccessTokenError" }
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshed.expires_in - 60),
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    }
  } catch {
    return { ...token, error: "RefreshAccessTokenError" }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const jwt = token as typeof token & JWTLike

      if (account) {
        jwt.accessToken = account.access_token
        jwt.refreshToken = account.refresh_token ?? jwt.refreshToken
        jwt.expiresAt = account.expires_at
        jwt.error = undefined
        return jwt
      }

      const now = Math.floor(Date.now() / 1000)
      if (jwt.accessToken && jwt.expiresAt && now < jwt.expiresAt - 30) {
        return jwt
      }

      return await refreshGoogleAccessToken(jwt)
    },
    async session({ session, token }) {
      const jwt = token as typeof token & JWTLike
      session.accessToken = jwt.accessToken as string
      return session
    },
  },
})
