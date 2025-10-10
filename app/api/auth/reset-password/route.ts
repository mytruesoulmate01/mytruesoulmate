import { type NextRequest, NextResponse } from "next/server"
import {
  validatePasswordResetToken,
  resetPassword,
  markTokenAsUsedHybrid,
  DatabaseError,
  logAuditEvent,
  incrementTokenVersion,
} from "@/lib/db"
import { validatePassword } from "@/lib/validation"
import { hashPassword } from "@/lib/password-security"
import { sendPasswordResetConfirmationEmail } from "@/lib/email-service"

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ResetPasswordRequest = await request.json()
    const { token, newPassword } = body

    // Application-level validation
    if (!token || token.length < 10) {
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Invalid reset token" }, { status: 400 })
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      return NextResponse.json({ error: "WEAK_PASSWORD", message: passwordError }, { status: 400 })
    }

    // Validate token using hybrid approach - single atomic query
    const tokenData = await validatePasswordResetToken(token)

    if (!tokenData) {
      // Log failed reset attempt (async, non-critical)
      const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

      logAuditEvent({
        action: "PASSWORD_RESET_FAILED",
        details: { reason: "invalid_token", token_prefix: token.substring(0, 8) },
        ip_address: clientIP,
      }).catch((error) => console.error("Audit log failed:", error))

      return NextResponse.json(
        {
          error: "INVALID_TOKEN",
          message: "Invalid, expired, or already used reset token",
        },
        { status: 400 },
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password - this is the critical operation (do this FIRST)
    const passwordUpdated = await resetPassword(tokenData.user_id, hashedPassword)

    if (!passwordUpdated) {
      throw new Error("Password update failed")
    }

    await incrementTokenVersion(tokenData.email_id)

    // Mark token as used (if this fails, token will expire naturally - acceptable risk)
    await markTokenAsUsedHybrid(token)

    // Log successful password reset (async, non-critical)
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    logAuditEvent({
      user_id: tokenData.user_id,
      action: "PASSWORD_RESET_SUCCESS",
      details: { email: tokenData.email_id, sessions_invalidated: true },
      ip_address: clientIP,
      user_agent: userAgent,
    }).catch((error) => console.error("Audit log failed:", error))

    const emailResult = await sendPasswordResetConfirmationEmail(tokenData.email_id, clientIP)

    if (!emailResult.success) {
      console.error("[v0] Confirmation email failed:", {
        email: tokenData.email_id,
        error: emailResult.error,
        ipAddress: clientIP,
      })
    } else {
      console.log("[v0] Confirmation email sent successfully:", {
        email: tokenData.email_id,
        messageId: emailResult.messageId,
      })
    }

    console.log(`Password reset completed in ${Date.now() - startTime}ms for user ${tokenData.user_id}`)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. All existing sessions have been logged out for security.",
    })
  } catch (error) {
    console.error("Password reset error:", error)

    // Handle hybrid database errors
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          error: error.code,
          message: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "RESET_FAILED",
        message: "Password reset failed. Please try again or request a new reset link.",
      },
      { status: 500 },
    )
  }
}
