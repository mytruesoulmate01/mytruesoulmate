import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required for secure token generation")
}
const secret = new TextEncoder().encode(jwtSecret)

// ✅ Minimal stable payload structure
export interface JWTPayload {
  sub: string // user_id (must be stable)
  email: string // user email
  tokenVersion: number // token version for invalidation
  iat?: number // issued at (auto-filled)
  exp?: number // expiry (auto-filled)
}

// ✅ Create token with only sub, email, and role
export async function generateJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)

  return jwt
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error("[SECURITY] JWT verification failed:", error)
    return null
  }
}

export function setJWTCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  })
}

export function clearJWTCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
}

export function extractJWTFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim())
  const authCookie = cookies.find((cookie) => cookie.startsWith("auth-token="))

  if (!authCookie) return null

  return authCookie.split("=")[1]
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  return verifyJWT(token)
}
