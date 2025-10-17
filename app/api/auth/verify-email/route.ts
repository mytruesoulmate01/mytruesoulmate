import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateOTP, sanitizeEmail, validateEmail } from "@/lib/validation"

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { otp, email } = body

    const otpError = validateOTP(otp)
    if (otpError) {
      return NextResponse.json(
        {
          error: "INVALID_OTP",
          message: otpError,
        },
        { status: 400 },
      )
    }

    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json(
        {
          error: "INVALID_EMAIL",
          message: emailError,
        },
        { status: 400 },
      )
    }

    const sanitizedEmail = sanitizeEmail(email)

    const attemptKey = sanitizedEmail
    const attempt = failedAttempts.get(attemptKey)
    if (attempt && attempt.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / (1000 * 60))
      return NextResponse.json(
        {
          error: "ACCOUNT_LOCKED",
          message: `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        },
        { status: 429 },
      )
    }

    console.log("[v0] Verifying email with OTP")

    const result = await sql`
      SELECT 
        user_id,
        email_id,
        email_verified,
        otp_expires_at
      FROM user_registration
      WHERE email_id = ${sanitizedEmail}
        AND email_verification_otp = ${otp}
      LIMIT 1
    `

    if (result.length === 0) {
      console.log("[v0] Invalid OTP - no matching user found")

      const currentAttempt = failedAttempts.get(attemptKey) || { count: 0, lockedUntil: 0 }
      currentAttempt.count += 1

      if (currentAttempt.count >= 5) {
        currentAttempt.lockedUntil = Date.now() + 15 * 60 * 1000 // Lock for 15 minutes
        failedAttempts.set(attemptKey, currentAttempt)

        return NextResponse.json(
          {
            error: "ACCOUNT_LOCKED",
            message: "Too many failed attempts. Your account has been locked for 15 minutes.",
          },
          { status: 429 },
        )
      }

      failedAttempts.set(attemptKey, currentAttempt)

      return NextResponse.json(
        {
          error: "INVALID_OTP",
          message: "Invalid verification code. Please check and try again.",
          attemptsRemaining: 5 - currentAttempt.count,
        },
        { status: 400 },
      )
    }

    const user = result[0]

    // Check if already verified
    if (user.email_verified) {
      console.log("[v0] Email already verified")
      failedAttempts.delete(attemptKey)

      return NextResponse.json(
        {
          success: true,
          message: "Email already verified. You can now log in.",
          alreadyVerified: true,
        },
        { status: 200 },
      )
    }

    const expiresAt = new Date(user.otp_expires_at)
    const now = new Date()

    if (now > expiresAt) {
      console.log("[v0] OTP expired")
      return NextResponse.json(
        {
          error: "OTP_EXPIRED",
          message: "Verification code has expired. Please request a new one.",
        },
        { status: 400 },
      )
    }

    await sql`
      UPDATE user_registration
      SET 
        email_verified = true,
        email_verified_at = NOW(),
        email_verification_otp = NULL,
        otp_expires_at = NULL
      WHERE user_id = ${user.user_id}
    `

    console.log("[v0] Email verified successfully", { userId: user.user_id })

    failedAttempts.delete(attemptKey)

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
