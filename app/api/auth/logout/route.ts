import { type NextRequest, NextResponse } from "next/server"
// import { validateCSRFToken, clearCSRFCookie } from "@/lib/csrf"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🔵 [LOGOUT_START] Logout process initiated", {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    })

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    console.log("🔵 [LOGOUT_COOKIE_CLEARING] Clearing authentication cookies")

    // Clear auth cookies
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    })

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    })

    console.log("🟢 [LOGOUT_COOKIES_CLEARED] Auth cookies cleared successfully", {
      authTokenCleared: true,
      refreshTokenCleared: true,
    })

    const duration = Date.now() - startTime
    console.log("🟢 [LOGOUT_COMPLETE] User logged out successfully", {
      totalDuration: duration,
      timestamp: new Date().toISOString(),
    })

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("🔴 [LOGOUT_ERROR] Error during logout process", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
