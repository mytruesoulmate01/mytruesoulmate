import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email-service"
import { sanitizeEmail, validateEmail } from "@/lib/validation"
import { randomBytes } from "crypto"

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
        email_verification_sent_at
      FROM user_registration
      WHERE email_id = ${sanitizedEmail}
      LIMIT 1
    `

    if (result.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, a verification link has been sent.",
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

    // Check rate limiting (must wait 5 minutes between resends)
    if (user.email_verification_sent_at) {
      const sentAt = new Date(user.email_verification_sent_at)
      const now = new Date()
      const minutesSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60)

      if (minutesSinceSent < 5) {
        const remainingMinutes = Math.ceil(5 - minutesSinceSent)
        return NextResponse.json(
          {
            error: "RATE_LIMITED",
            message: `Please wait ${remainingMinutes} minute(s) before requesting another verification email.`,
          },
          { status: 429 },
        )
      }
    }

    // Generate new token
    const verificationToken = randomBytes(32).toString("hex")

    // Update token in database
    await sql`
      UPDATE user_registration
      SET 
        email_verification_token = ${verificationToken},
        email_verification_sent_at = NOW()
      WHERE user_id = ${user.user_id}
    `

    console.log("[v0] New verification token generated", { userId: user.user_id })

    // Send verification email
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const emailResult = await sendVerificationEmail(sanitizedEmail, verificationToken, clientIP)

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
        message: "Verification email sent. Please check your inbox.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Resend verification error:", error)

    return NextResponse.json(
      {
        error: "RESEND_FAILED",
        message: "Failed to resend verification email. Please try again.",
      },
      { status: 500 },
    )
  }
}
