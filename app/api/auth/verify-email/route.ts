import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { logAuditEvent } from "@/lib/db"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        {
          error: "MISSING_TOKEN",
          message: "Verification token is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Verifying email with token")

    // Find user by verification token
    const result = await sql`
      SELECT 
        user_id,
        email_id,
        email_verified,
        email_verification_sent_at
      FROM user_registration
      WHERE email_verification_token = ${token}
      LIMIT 1
    `

    if (result.length === 0) {
      console.log("[v0] Invalid token - no user found")
      return NextResponse.json(
        {
          error: "INVALID_TOKEN",
          message: "Invalid or expired verification token",
        },
        { status: 400 },
      )
    }

    const user = result[0]

    // Check if already verified
    if (user.email_verified) {
      console.log("[v0] Email already verified")
      return NextResponse.json(
        {
          success: true,
          message: "Email already verified. You can now log in.",
          alreadyVerified: true,
        },
        { status: 200 },
      )
    }

    // Check if token expired (24 hours)
    const sentAt = new Date(user.email_verification_sent_at)
    const now = new Date()
    const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceSent > 24) {
      console.log("[v0] Token expired", { hoursSinceSent })
      return NextResponse.json(
        {
          error: "TOKEN_EXPIRED",
          message: "Verification link has expired. Please request a new one.",
        },
        { status: 400 },
      )
    }

    // Update user as verified
    await sql`
      UPDATE user_registration
      SET 
        email_verified = true,
        email_verified_at = NOW(),
        email_verification_token = NULL
      WHERE user_id = ${user.user_id}
    `

    console.log("[v0] Email verified successfully", { userId: user.user_id })

    // Log audit event
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    logAuditEvent({
      user_id: user.user_id,
      action: "EMAIL_VERIFIED",
      details: { email: user.email_id },
      ip_address: clientIP,
      user_agent: userAgent,
    }).catch((error) => console.error("Audit log failed:", error))

    const duration = Date.now() - startTime
    console.log(`Email verification completed in ${duration}ms`)

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now log in.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Email verification error:", error)

    return NextResponse.json(
      {
        error: "VERIFICATION_FAILED",
        message: "Failed to verify email. Please try again.",
      },
      { status: 500 },
    )
  }
}
