import { type NextRequest, NextResponse } from "next/server"
import {
  validatePasswordResetToken,
  resetPassword,
  markTokenAsUsedHybrid,
  DatabaseError,
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

  console.log("[v0] Password reset request received", {
    timestamp: new Date().toISOString(),
    method: "POST",
    url: request.url,
  })

  try {
    const body: ResetPasswordRequest = await request.json()
    const { token, newPassword } = body

    console.log("[v0] Request body parsed", {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 20) + "..." : "none",
      hasPassword: !!newPassword,
      passwordLength: newPassword?.length,
    })

    // Application-level validation
    if (!token || token.length < 10) {
      console.log("[v0] Invalid token format", {
        hasToken: !!token,
        tokenLength: token?.length,
      })
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Invalid reset token" }, { status: 400 })
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      console.log("[v0] Password validation failed", {
        error: passwordError,
        passwordLength: newPassword?.length,
      })
      return NextResponse.json({ error: "WEAK_PASSWORD", message: passwordError }, { status: 400 })
    }

    console.log("[v0] Validating password reset token", {
      tokenPreview: token.substring(0, 20) + "...",
    })

    // Validate token using hybrid approach - single atomic query
    const tokenData = await validatePasswordResetToken(token)

    if (!tokenData) {
      console.log("[v0] Token validation failed", {
        tokenPreview: token.substring(0, 20) + "...",
        reason: "Invalid, expired, or already used",
      })

      return NextResponse.json(
        {
          error: "INVALID_TOKEN",
          message: "Invalid, expired, or already used reset token",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Token validated successfully", {
      userId: tokenData.user_id,
      email: tokenData.email_id,
    })

    console.log("[v0] Hashing new password", {
      userId: tokenData.user_id,
    })

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    console.log("[v0] Password hashed successfully", {
      userId: tokenData.user_id,
      hashedPasswordPreview: hashedPassword.substring(0, 20) + "...",
    })

    console.log("[v0] Updating user password in database", {
      userId: tokenData.user_id,
    })

    // Update password - this is the critical operation (do this FIRST)
    const passwordUpdated = await resetPassword(tokenData.user_id, hashedPassword)

    if (!passwordUpdated) {
      console.log("[v0] Password update failed", {
        userId: tokenData.user_id,
      })
      throw new Error("Password update failed")
    }

    console.log("[v0] Password updated successfully", {
      userId: tokenData.user_id,
    })

    console.log("[v0] Incrementing token version to invalidate sessions", {
      userId: tokenData.user_id,
      email: tokenData.email_id,
    })

    await incrementTokenVersion(tokenData.email_id)

    console.log("[v0] Token version incremented", {
      userId: tokenData.user_id,
    })

    console.log("[v0] Marking reset token as used", {
      userId: tokenData.user_id,
      tokenPreview: token.substring(0, 20) + "...",
    })

    // Mark token as used (if this fails, token will expire naturally - acceptable risk)
    await markTokenAsUsedHybrid(token)

    console.log("[v0] Reset token marked as used", {
      userId: tokenData.user_id,
    })

    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    console.log("[v0] Sending password reset confirmation email", {
      email: tokenData.email_id,
      ipAddress: clientIP,
    })

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

    const totalDuration = Date.now() - startTime
    console.log(`[v0] Password reset completed successfully in ${totalDuration}ms`, {
      userId: tokenData.user_id,
      email: tokenData.email_id,
      duration: totalDuration,
    })

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. All existing sessions have been logged out for security.",
    })
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error("[v0] Password reset error:", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      duration: totalDuration,
    })

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
