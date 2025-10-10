import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, DatabaseError, logAuditEvent, incrementFailedAttempts, resetFailedAttempts } from "@/lib/db"
import { generateJWT } from "@/lib/jwt"
import { setAuthCookie } from "@/lib/cookies"
import { validateEmail, sanitizeEmail } from "@/lib/validation"
import { verifyPassword } from "@/lib/password-security"
import { isAccountCurrentlyLocked, getRemainingLockoutTime, ACCOUNT_LOCKOUT_CONFIG } from "@/lib/account-lockout-config"

export interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Application-level validation
    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json({ error: "INVALID_EMAIL", message: emailError }, { status: 400 })
    }

    if (!password || password.length < 1) {
      return NextResponse.json({ error: "INVALID_PASSWORD", message: "Password is required" }, { status: 400 })
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email)

    // Get user using hybrid approach
    const user = await authenticateUser(sanitizedEmail)

    if (!user) {
      // Log failed login attempt (async, non-critical)
      const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"

      logAuditEvent({
        action: "LOGIN_FAILED",
        details: { email: sanitizedEmail, reason: "user_not_found" },
        ip_address: clientIP,
        user_agent: userAgent,
      }).catch((error) => console.error("Audit log failed:", error))

      return NextResponse.json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password" }, { status: 401 })
    }

    if (!user.email_verified) {
      const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"

      logAuditEvent({
        user_id: user.user_id,
        action: "LOGIN_BLOCKED_UNVERIFIED",
        details: { email: sanitizedEmail, reason: "email_not_verified" },
        ip_address: clientIP,
        user_agent: userAgent,
      }).catch((error) => console.error("Audit log failed:", error))

      return NextResponse.json(
        {
          error: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email address before logging in. Check your inbox for the verification link.",
        },
        { status: 403 },
      )
    }

    if (isAccountCurrentlyLocked(user)) {
      const remainingTime = getRemainingLockoutTime(user)

      // Log lockout attempt
      const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"

      logAuditEvent({
        user_id: user.user_id,
        action: "LOGIN_BLOCKED_LOCKED",
        details: { email: sanitizedEmail, remaining_minutes: remainingTime },
        ip_address: clientIP,
        user_agent: userAgent,
      }).catch((error) => console.error("Audit log failed:", error))

      return NextResponse.json(
        {
          error: "ACCOUNT_LOCKED",
          message: `Account is locked. Try again in ${remainingTime} minutes.`,
          remainingMinutes: remainingTime,
        },
        { status: 423 },
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      await incrementFailedAttempts(sanitizedEmail)

      const newFailedAttempts = (user.failed_attempts || 0) + 1

      // Lock account if threshold reached
      if (newFailedAttempts >= ACCOUNT_LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
        // Account will be locked by checking failed_attempts in isAccountCurrentlyLocked
      }

      // Log failed login attempt (async, non-critical)
      const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"

      logAuditEvent({
        user_id: user.user_id,
        action: "LOGIN_FAILED",
        details: {
          email: sanitizedEmail,
          reason: "invalid_password",
          failed_attempts: newFailedAttempts,
          account_locked: newFailedAttempts >= ACCOUNT_LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS,
        },
        ip_address: clientIP,
        user_agent: userAgent,
      }).catch((error) => console.error("Audit log failed:", error))

      // Return different message if account was just locked
      if (newFailedAttempts >= ACCOUNT_LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
        return NextResponse.json(
          {
            error: "ACCOUNT_LOCKED",
            message: `Too many failed attempts. Account locked for ${ACCOUNT_LOCKOUT_CONFIG.LOCKOUT_DURATION_MINUTES} minutes.`,
            remainingMinutes: ACCOUNT_LOCKOUT_CONFIG.LOCKOUT_DURATION_MINUTES,
          },
          { status: 423 },
        )
      }

      return NextResponse.json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password" }, { status: 401 })
    }

    if (user.failed_attempts && user.failed_attempts > 0) {
      await resetFailedAttempts(sanitizedEmail)
    }

    // Generate JWT tokens
    try {
      const accessToken = await generateJWT({
        sub: user.user_id.toString(),
        email: user.email_id,
        tokenVersion: user.token_version || 1, // Include token version from database
      })

      // Create response
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.user_id,
          email: user.email_id,
          role: user.user_role,
          verified: user.email_verified, // Use actual email_verified status
        },
      })

      // Set authentication cookies
      setAuthCookie(response, accessToken)

      // Log successful login (async, non-critical)
      const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"

      logAuditEvent({
        user_id: user.user_id,
        action: "LOGIN_SUCCESS",
        details: { email: sanitizedEmail },
        ip_address: clientIP,
        user_agent: userAgent,
      }).catch((error) => console.error("Audit log failed:", error))

      console.log(`User login completed in ${Date.now() - startTime}ms for ${sanitizedEmail}`)

      return response
    } catch (jwtError) {
      console.error("[SECURITY] JWT generation failed during login:", jwtError)
      return NextResponse.json(
        {
          error: "LOGIN_FAILED",
          message: "Authentication system error. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Login error:", error)

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
        error: "LOGIN_FAILED",
        message: "Login failed. Please try again.",
      },
      { status: 500 },
    )
  }
}
