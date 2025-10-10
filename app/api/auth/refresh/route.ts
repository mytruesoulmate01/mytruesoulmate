import { type NextRequest, NextResponse } from "next/server"
import { verifyRefreshToken, generateJWT } from "@/lib/jwt"
import { setAuthCookie } from "@/lib/cookies"
import { getUserByIdWithRole } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not provided" }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshToken)

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    const user = await getUserByIdWithRole(payload.sub)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new access token
    try {
      const accessToken = await generateJWT({
        sub: user.user_id.toString(),
        email: user.email_id,
        tokenVersion: user.token_version || 1, // Include current token version
      })

      // Create response
      const response = NextResponse.json({ success: true })

      // Set new auth cookie
      setAuthCookie(response, accessToken)

      return response
    } catch (jwtError) {
      console.error("[SECURITY] JWT generation failed during token refresh:", jwtError)
      return NextResponse.json({ error: "Token refresh failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("[SECURITY] Token refresh error:", error)

    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      console.error("🚨 [SECURITY] JWT configuration error during token refresh")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
