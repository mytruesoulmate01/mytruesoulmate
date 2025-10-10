import type { NextResponse } from "next/server"

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
  maxAge?: number
  path?: string
}

/**
 * Set secure authentication cookie
 */
export function setAuthCookie(response: NextResponse, token: string, options: CookieOptions = {}): void {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: true, // Always use secure cookies
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
    ...options,
  }

  const cookieString = `auth-token=${token}; HttpOnly=${defaultOptions.httpOnly}; Secure=${defaultOptions.secure}; SameSite=${defaultOptions.sameSite}; Max-Age=${defaultOptions.maxAge}; Path=${defaultOptions.path}`

  response.headers.set("Set-Cookie", cookieString)
}

/**
 * Set refresh token cookie
 */
export function setRefreshTokenCookie(response: NextResponse, refreshToken: string): void {
  const cookieString = `refresh-token=${refreshToken}; HttpOnly=true; Secure=true; SameSite=strict; Max-Age=${60 * 60 * 24 * 7}; Path=/`

  // Get existing cookies
  const existingCookies = response.headers.get("Set-Cookie") || ""
  const newCookies = existingCookies ? `${existingCookies}, ${cookieString}` : cookieString

  response.headers.set("Set-Cookie", newCookies)
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  const authCookieString = "auth-token=; HttpOnly=true; Secure=true; SameSite=strict; Max-Age=0; Path=/"
  const refreshCookieString = "refresh-token=; HttpOnly=true; Secure=true; SameSite=strict; Max-Age=0; Path=/"

  response.headers.set("Set-Cookie", `${authCookieString}, ${refreshCookieString}`)
}

/**
 * Parse cookies from request header
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}

  return cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=")
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    },
    {} as Record<string, string>,
  )
}
