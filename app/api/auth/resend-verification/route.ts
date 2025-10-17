import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email-service"
import { sanitizeEmail, validateEmail } from "@/lib/validation"
import { generateOTP } from "@/lib/otp-service"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json({ error: "INVALID_EMAIL", message: emailError }, { status: 400 })
    }

    const sanitizedEmail = sanitizeEmail(email)

    console.log("[v0] Resending verification email", { email: sanitizedEmail })

    // Find user
    const result = await sql`
      SELECT 
        user_id,
        email_id,
        email_verified,
        otp_expires_at
      FROM user_registration
      WHERE email_id = ${sanitizedEmail}
      LIMIT 1
    `

    if (result.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, a verification code has been sent.",
        },
        { status: 200 },
      )
    }

    const user = result[0]

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        {
          error: "ALREADY_VERIFIED",
          message: "Email is already verified. You can log in now.",
        },
        { status: 400 },
      )
    }

    if (user.otp_expires_at) {
      const expiresAt = new Date(user.otp_expires_at)
      const now = new Date()
      // OTP is valid for 10 minutes, so if less than 5 minutes have passed since it was sent, rate limit
      const timeSinceSent = now.getTime() - (expiresAt.getTime() - 10 * 60 * 1000)
      const minutesSinceSent = timeSinceSent / (1000 * 60)

      if (minutesSinceSent < 5) {
        const remainingMinutes = Math.ceil(5 - minutesSinceSent)
        return NextResponse.json(
          {
            error: "RATE_LIMITED",
            message: `Please wait ${remainingMinutes} minute(s) before requesting another verification code.`,
          },
          { status: 429 },
        )
      }
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    await sql`
      UPDATE user_registration
      SET 
        email_verification_otp = ${otp},
        otp_expires_at = ${expiresAt.toISOString()}
      WHERE user_id = ${user.user_id}
    `

    console.log("[v0] New OTP generated", { userId: user.user_id })

    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const emailResult = await sendVerificationEmail(sanitizedEmail, otp, clientIP)

    if (!emailResult.success) {
      console.error("[v0] Failed to send verification email", { error: emailResult.error })
      return NextResponse.json(
        {
          error: "EMAIL_FAILED",
          message: "Failed to send verification email. Please try again later.",
        },
        { status: 500 },
      )
    }

    const duration = Date.now() - startTime
    console.log(`Verification email resent in ${duration}ms`)

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent. Please check your inbox.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Resend verification error:", error)

    return NextResponse.json(
      {
        error: "RESEND_FAILED",
        message: "Failed to resend verification code. Please try again.",
      },
      { status: 500 },
    )
  }
}
