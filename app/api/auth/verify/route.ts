import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      console.log("[AUTH] No auth token found in cookies")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Verify JWT token
    const payload = await verifyJWT(token)
    if (!payload) {
      console.log("[AUTH] Invalid token - verification failed")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      console.log("Token expired", { exp: payload.exp, now: currentTime })
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    console.log("Authentication successful", {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role || "user", // Handle legacy tokens without role
        trustScore: payload.trust_score,
        verified: payload.verified,
        tokenExpiry: payload.exp,
      },
    })
  } catch (error) {
    console.error("[SECURITY] Token verification error:", error)

    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      console.error("🚨 [SECURITY] JWT configuration error during token verification")
      return NextResponse.json({ authenticated: false, error: "Server configuration error" }, { status: 500 })
    }

    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
