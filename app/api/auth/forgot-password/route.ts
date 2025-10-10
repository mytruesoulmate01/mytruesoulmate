import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { logger } from "@/lib/logger"
import {
  validateUserForPasswordReset,
  storePasswordResetToken,
  checkPasswordResetRateLimit,
} from "@/lib/password-reset-db"
import { createTokenData } from "@/lib/password-reset-utils"
import { sendPasswordResetEmail } from "@/lib/email-service"

// Rate limiting configuration
const GLOBAL_RATE_LIMIT = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS_PER_IP = 10 // Max 10 requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function checkGlobalRateLimit(ipAddress: string): boolean {
  const now = Date.now()
  const limit = GLOBAL_RATE_LIMIT.get(ipAddress)

  logger.debug(
    "forgot-password",
    "Checking global rate limit",
    {
      ipAddress,
      currentLimit: limit,
      maxRequests: MAX_REQUESTS_PER_IP,
    },
    "rate-limit-check",
  )

  if (!limit) {
    GLOBAL_RATE_LIMIT.set(ipAddress, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    logger.debug(
      "forgot-password",
      "New IP address, setting initial rate limit",
      {
        ipAddress,
        resetTime: new Date(now + RATE_LIMIT_WINDOW).toISOString(),
      },
      "rate-limit-init",
    )
    return true
  }

  if (now > limit.resetTime) {
    GLOBAL_RATE_LIMIT.set(ipAddress, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    logger.debug(
      "forgot-password",
      "Rate limit window expired, resetting",
      {
        ipAddress,
        previousCount: limit.count,
        newResetTime: new Date(now + RATE_LIMIT_WINDOW).toISOString(),
      },
      "rate-limit-reset",
    )
    return true
  }

  if (limit.count >= MAX_REQUESTS_PER_IP) {
    logger.security(
      "forgot-password",
      "Global rate limit exceeded",
      {
        ipAddress,
        currentCount: limit.count,
        maxAllowed: MAX_REQUESTS_PER_IP,
        resetTime: new Date(limit.resetTime).toISOString(),
      },
      "rate-limit-exceeded",
    )
    return false
  }

  limit.count++
  logger.debug(
    "forgot-password",
    "Rate limit updated",
    {
      ipAddress,
      newCount: limit.count,
      remaining: MAX_REQUESTS_PER_IP - limit.count,
    },
    "rate-limit-update",
  )
  return true
}

function getClientIP(request: NextRequest): string {
  const headersList = headers()
  const forwarded = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")

  let detectedIP = "unknown"
  let source = "fallback"

  if (forwarded) {
    detectedIP = forwarded.split(",")[0].trim()
    source = "x-forwarded-for"
  } else if (realIP) {
    detectedIP = realIP
    source = "x-real-ip"
  } else if (request.ip) {
    detectedIP = request.ip
    source = "request.ip"
  }

  logger.debug(
    "forgot-password",
    "Client IP detected",
    {
      ip: detectedIP,
      source,
      forwardedHeader: forwarded,
      realIPHeader: realIP,
    },
    "ip-detection",
  )

  return detectedIP
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email) && email.length <= 254

  logger.debug(
    "forgot-password",
    "Email validation",
    {
      emailLength: email.length,
      isValid,
      hasAtSymbol: email.includes("@"),
      hasDot: email.includes("."),
    },
    "email-validation",
  )

  return isValid
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ipAddress = getClientIP(request)

  logger.startTimer("forgot-password", "total-request")
  logger.info(
    "forgot-password",
    "Password reset request initiated",
    {
      ipAddress,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    },
    "request-start",
  )

  try {
    // Parse request body
    logger.startTimer("forgot-password", "body-parsing")
    const body = await request.json()
    const { email } = body
    logger.endTimer("forgot-password", "body-parsing")

    logger.debug(
      "forgot-password",
      "Request body parsed",
      {
        hasEmail: !!email,
        emailType: typeof email,
      },
      "body-parsed",
    )

    // Input validation
    if (!email || typeof email !== "string") {
      logger.warn(
        "forgot-password",
        "Invalid email format provided",
        {
          ipAddress,
          email: email ? "provided" : "missing",
          emailType: typeof email,
        },
        "input-validation",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Valid email address is required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    if (!isValidEmail(email.toLowerCase().trim())) {
      logger.warn(
        "forgot-password",
        "Malformed email provided",
        {
          ipAddress,
          emailLength: email.length,
          emailSample: email.substring(0, 10) + "...",
        },
        "email-format-validation",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    logger.debug(
      "forgot-password",
      "Email normalized",
      {
        originalLength: email.length,
        normalizedLength: normalizedEmail.length,
        wasModified: email !== normalizedEmail,
      },
      "email-normalization",
    )

    // Check global rate limiting (IP-based)
    logger.startTimer("forgot-password", "rate-limit-check")
    if (!checkGlobalRateLimit(ipAddress)) {
      logger.endTimer("forgot-password", "rate-limit-check")
      logger.security(
        "forgot-password",
        "Global rate limit exceeded",
        {
          ipAddress,
          email: normalizedEmail,
          maxRequests: MAX_REQUESTS_PER_IP,
          windowMinutes: RATE_LIMIT_WINDOW / (60 * 1000),
        },
        "rate-limit-exceeded",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Too many password reset requests from this IP address. Please try again later.",
        },
        { status: 429 },
      )
    }
    logger.endTimer("forgot-password", "rate-limit-check")

    // Validate user exists
    logger.startTimer("forgot-password", "user-validation")
    const userValidation = await validateUserForPasswordReset(normalizedEmail)
    logger.endTimer("forgot-password", "user-validation")

    if (!userValidation.valid) {
      // Don't reveal whether user exists or not for security
      logger.audit(
        "forgot-password",
        "Password reset requested for non-existent user",
        {
          email: normalizedEmail,
          ipAddress,
          timestamp: new Date().toISOString(),
        },
        "non-existent-user",
      )

      // Return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we have sent a password reset link.",
      })
    }

    const userId = userValidation.userId!
    logger.info(
      "forgot-password",
      "User validation successful",
      {
        userId,
        email: normalizedEmail,
        ipAddress,
      },
      "user-found",
    )

    // Check user-specific rate limiting
    logger.startTimer("forgot-password", "user-rate-limit")
    const rateLimitCheck = await checkPasswordResetRateLimit(userId, 5) // 5 minute cooldown
    logger.endTimer("forgot-password", "user-rate-limit")

    if (!rateLimitCheck.canRequest) {
      const timeRemaining = rateLimitCheck.lastRequestTime
        ? Math.ceil((5 * 60 * 1000 - (Date.now() - rateLimitCheck.lastRequestTime.getTime())) / 1000 / 60)
        : 5

      logger.security(
        "forgot-password",
        "User rate limit exceeded",
        {
          userId,
          email: normalizedEmail,
          ipAddress,
          lastRequestTime: rateLimitCheck.lastRequestTime,
          timeRemainingMinutes: timeRemaining,
        },
        "user-rate-limit-exceeded",
      )

      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${timeRemaining} minutes before requesting another password reset.`,
        },
        { status: 429 },
      )
    }

    // Generate secure token
    logger.startTimer("forgot-password", "token-generation")
    const tokenData = await createTokenData(userId, ipAddress)
    logger.endTimer("forgot-password", "token-generation")

    logger.debug(
      "forgot-password",
      "Token generated successfully",
      {
        userId,
        tokenLength: tokenData.token.length,
        expiresAt: tokenData.expiresAt.toISOString(),
        hashedTokenLength: tokenData.hashedToken.length,
      },
      "token-generated",
    )

    // Store token in database
    logger.startTimer("forgot-password", "token-storage")
    const storeResult = await storePasswordResetToken(userId, tokenData.hashedToken, tokenData.expiresAt, ipAddress)
    logger.endTimer("forgot-password", "token-storage")

    if (!storeResult.success) {
      logger.error(
        "forgot-password",
        "Failed to store password reset token",
        undefined,
        {
          userId,
          email: normalizedEmail,
          ipAddress,
          error: storeResult.error,
        },
        "token-storage-failed",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Unable to process password reset request. Please try again later.",
        },
        { status: 500 },
      )
    }

    logger.info(
      "forgot-password",
      "Token stored successfully",
      {
        userId,
        tokenId: storeResult.tokenId,
        expiresAt: tokenData.expiresAt.toISOString(),
      },
      "token-stored",
    )

    // Send password reset email
    logger.startTimer("forgot-password", "email-sending")
    const emailResult = await sendPasswordResetEmail(
      normalizedEmail,
      tokenData.token, // Send raw token in email
      ipAddress,
    )
    logger.endTimer("forgot-password", "email-sending")

    if (!emailResult.success) {
      logger.error(
        "forgot-password",
        "Failed to send password reset email",
        undefined,
        {
          userId,
          email: normalizedEmail,
          ipAddress,
          error: emailResult.error,
        },
        "email-send-failed",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Unable to send password reset email. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Log successful password reset request
    const totalDuration = logger.endTimer("forgot-password", "total-request")
    logger.audit(
      "forgot-password",
      "Password reset email sent successfully",
      {
        userId,
        email: normalizedEmail,
        ipAddress,
        processingTime: Date.now() - startTime,
        totalDuration,
        timestamp: new Date().toISOString(),
      },
      "request-completed",
    )

    logger.performance("forgot-password", "Request completed successfully", totalDuration, {
      userId,
      ipAddress,
      steps: ["validation", "rate-limiting", "token-generation", "storage", "email-sending"],
    })

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we have sent a password reset link.",
    })
  } catch (error) {
    const totalDuration = Date.now() - startTime
    logger.error(
      "forgot-password",
      "Unexpected error in forgot password endpoint",
      error as Error,
      {
        ipAddress,
        processingTime: totalDuration,
        timestamp: new Date().toISOString(),
      },
      "unexpected-error",
    )

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  logger.warn(
    "forgot-password",
    "GET method attempted on forgot password endpoint",
    {
      timestamp: new Date().toISOString(),
    },
    "method-not-allowed",
  )
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  logger.warn(
    "forgot-password",
    "PUT method attempted on forgot password endpoint",
    {
      timestamp: new Date().toISOString(),
    },
    "method-not-allowed",
  )
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  logger.warn(
    "forgot-password",
    "DELETE method attempted on forgot password endpoint",
    {
      timestamp: new Date().toISOString(),
    },
    "method-not-allowed",
  )
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
