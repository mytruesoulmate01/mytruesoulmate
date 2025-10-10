import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { sql } from "@/lib/db"
import { verifyToken, isValidTokenFormat, isTokenExpired } from "@/lib/password-reset-utils"

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

  console.log("🔵 [reset-password-validate::ip-detection] Client IP detected", {
    ip: detectedIP,
    source,
    forwardedHeader: forwarded,
    realIPHeader: realIP,
  })

  return detectedIP
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ipAddress = getClientIP(request)

  console.log("🔵 [reset-password-validate::request-start] Token validation request initiated", {
    ipAddress,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
    method: "POST",
    url: request.url,
  })

  try {
    // Parse request body
    const bodyStartTime = Date.now()
    console.log("🔵 [reset-password-validate::body-parsing-start] Starting request body parsing", {
      contentType: request.headers.get("content-type"),
      contentLength: request.headers.get("content-length"),
    })

    const body = await request.json()
    const { token } = body
    const bodyDuration = Date.now() - bodyStartTime

    console.log("🔵 [reset-password-validate::body-parsing] Timer ended - Duration: " + bodyDuration + "ms", {
      duration: bodyDuration,
    })

    console.log("🔵 [reset-password-validate::body-parsed] Request body parsed", {
      hasToken: !!token,
      tokenType: typeof token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + "..." : "none",
      bodyKeys: Object.keys(body),
      bodySize: JSON.stringify(body).length,
    })

    // Input validation
    if (!token || typeof token !== "string") {
      console.log("🔴 [reset-password-validate::invalid-token-format] Invalid token format provided", {
        ipAddress,
        hasToken: !!token,
        tokenType: typeof token,
        tokenValue: token,
        bodyReceived: body,
      })

      return NextResponse.json(
        {
          valid: false,
          error: "Valid token is required",
        },
        { status: 400 },
      )
    }

    // Validate token format
    const formatStartTime = Date.now()
    console.log("🔵 [reset-password-validate::format-validation-start] Starting token format validation", {
      tokenLength: token.length,
      expectedLength: 64,
      tokenPreview: token.substring(0, 20) + "...",
      tokenSuffix: "..." + token.substring(token.length - 10),
    })

    const isValidFormat = isValidTokenFormat(token)
    const formatDuration = Date.now() - formatStartTime

    console.log("🔵 [reset-password-validate::format-validation] Timer ended - Duration: " + formatDuration + "ms", {
      duration: formatDuration,
      isValidFormat,
      tokenLength: token.length,
      expectedLength: 64,
    })

    if (!isValidFormat) {
      console.log("🔴 [reset-password-validate::invalid-format] Invalid token format detected", {
        ipAddress,
        tokenLength: token.length,
        tokenSample: token.substring(0, 8) + "...",
        expectedLength: 64,
        isString: typeof token === "string",
        containsOnlyHex: /^[a-f0-9]+$/i.test(token),
      })

      return NextResponse.json(
        {
          valid: false,
          error: "Invalid token format",
        },
        { status: 400 },
      )
    }

    // **CRITICAL DEBUG**: Get all active tokens for verification
    const dbStartTime = Date.now()
    const currentTimestamp = new Date().toISOString()

    console.log("🔵 [reset-password-validate::database-query-start] Starting database query for active tokens", {
      currentTime: currentTimestamp,
      ipAddress,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + "...",
      query:
        "SELECT user_id, token, expires_at, used, created_at, id FROM password_reset_tokens WHERE used = false AND expires_at > NOW() ORDER BY created_at DESC",
    })

    const result = await sql`
      SELECT user_id, token, expires_at, used, created_at, id 
      FROM password_reset_tokens 
      WHERE used = false AND expires_at > NOW()
      ORDER BY created_at DESC
    `

    const dbDuration = Date.now() - dbStartTime
    console.log("🔵 [reset-password-validate::database-lookup] Timer ended - Duration: " + dbDuration + "ms", {
      duration: dbDuration,
    })

    // **CRITICAL DEBUG**: Log detailed database results
    console.log("🔵 [reset-password-validate::database-results] Database query completed", {
      totalRows: result.length,
      ipAddress,
      currentTime: new Date().toISOString(),
      queryDuration: dbDuration + "ms",
      hasRows: result.length > 0,
    })

    // **CRITICAL DEBUG**: Log each token found (safely)
    if (result.length > 0) {
      console.log("🔵 [reset-password-validate::active-tokens-found] Found active tokens in database", {
        totalActiveTokens: result.length,
        inputTokenPreview: token.substring(0, 20) + "...",
      })

      result.forEach((row, index) => {
        const expiresAt = new Date(row.expires_at)
        const createdAt = new Date(row.created_at)
        const currentTime = new Date()
        const isExpired = expiresAt < currentTime
        const timeUntilExpiry = Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000 / 60)

        console.log(`🔵 [reset-password-validate::token-${index}] Found active token details`, {
          tokenId: row.id,
          userId: row.user_id,
          used: row.used,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          tokenPreview: row.token ? row.token.substring(0, 20) + "..." : "null",
          tokenLength: row.token ? row.token.length : 0,
          isExpired: isExpired,
          timeUntilExpiryMinutes: timeUntilExpiry,
          tokenStartsWith: row.token ? row.token.substring(0, 10) : "null",
          tokenType: row.token ? (row.token.startsWith("$2b$") ? "bcrypt-hash" : "unknown") : "null",
        })
      })
    } else {
      console.log("🔴 [reset-password-validate::no-active-tokens] No active tokens found in database", {
        ipAddress,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + "...",
        currentTime: new Date().toISOString(),
        queryUsed: "WHERE used = false AND expires_at > NOW()",
      })

      // **ADDITIONAL DEBUG**: Check if ANY tokens exist for debugging
      console.log("🔵 [reset-password-validate::debug-query-start] Running debug query to check all tokens", {
        purpose: "Check if any tokens exist in database",
      })

      const debugStartTime = Date.now()
      const allTokensResult = await sql`
        SELECT user_id, token, expires_at, used, created_at, id 
        FROM password_reset_tokens 
        ORDER BY created_at DESC 
        LIMIT 10
      `

      const debugDuration = Date.now() - debugStartTime

      console.log("🔵 [reset-password-validate::debug-query-results] Debug query completed", {
        totalTokensInDB: allTokensResult.length,
        queryDuration: debugDuration + "ms",
      })

      if (allTokensResult.length > 0) {
        console.log("🔵 [reset-password-validate::all-tokens-debug] Recent tokens in database (for debugging)", {
          totalTokens: allTokensResult.length,
          note: "These are ALL tokens, including expired/used ones",
        })

        allTokensResult.forEach((row, index) => {
          const expiresAt = new Date(row.expires_at)
          const currentTime = new Date()
          const isExpired = expiresAt < currentTime
          const minutesSinceCreated = Math.floor(
            (currentTime.getTime() - new Date(row.created_at).getTime()) / 1000 / 60,
          )

          console.log(`🔵 [reset-password-validate::debug-token-${index}] Token in database`, {
            tokenId: row.id,
            userId: row.user_id,
            used: row.used,
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            isExpired: isExpired,
            minutesSinceCreated: minutesSinceCreated,
            tokenPreview: row.token ? row.token.substring(0, 20) + "..." : "null",
            tokenLength: row.token ? row.token.length : 0,
            wouldBeActiveIf: {
              notUsed: !row.used,
              notExpired: !isExpired,
              bothConditions: !row.used && !isExpired,
            },
          })
        })
      } else {
        console.log("🔴 [reset-password-validate::no-tokens-in-db] No tokens found in database at all", {
          tableName: "password_reset_tokens",
          possibleIssues: ["table doesn't exist", "no tokens ever created", "database connection issue"],
        })
      }

      return NextResponse.json(
        {
          valid: false,
          error: "Invalid or expired token",
        },
        { status: 400 },
      )
    }

    let validTokenData = null

    // **CRITICAL DEBUG**: Check each active token to find a match using bcrypt verification
    const verificationStartTime = Date.now()
    console.log("🔵 [reset-password-validate::token-verification-start] Starting token verification process", {
      tokensToCheck: result.length,
      inputTokenPreview: token.substring(0, 20) + "...",
      inputTokenLength: token.length,
      verificationMethod: "bcrypt.compare",
    })

    for (let i = 0; i < result.length; i++) {
      const tokenRow = result[i]

      console.log(
        `🔵 [reset-password-validate::verifying-token-${i}] Starting verification for token ${i + 1}/${result.length}`,
        {
          tokenId: tokenRow.id,
          userId: tokenRow.user_id,
          dbTokenPreview: tokenRow.token.substring(0, 20) + "...",
          dbTokenLength: tokenRow.token.length,
          inputTokenPreview: token.substring(0, 20) + "...",
          inputTokenLength: token.length,
          dbTokenType: tokenRow.token.startsWith("$2b$") ? "bcrypt-hash" : "unknown",
        },
      )

      try {
        const compareStartTime = Date.now()
        console.log(`🔵 [reset-password-validate::bcrypt-compare-start-${i}] Starting bcrypt.compare`, {
          tokenId: tokenRow.id,
          comparisonNumber: i + 1,
          inputToken: "raw-hex-string",
          dbToken: "bcrypt-hash",
        })

        const isMatch = await verifyToken(token, tokenRow.token)
        const compareDuration = Date.now() - compareStartTime

        console.log(`🔵 [reset-password-validate::bcrypt-compare-${i}] bcrypt.compare completed`, {
          tokenId: tokenRow.id,
          isMatch: isMatch,
          duration: compareDuration + "ms",
          comparisonNumber: i + 1,
          result: isMatch ? "MATCH_FOUND" : "NO_MATCH",
        })

        if (isMatch) {
          validTokenData = tokenRow
          console.log("✅ [reset-password-validate::token-match-found] Token match found!", {
            tokenId: tokenRow.id,
            userId: tokenRow.user_id,
            expiresAt: tokenRow.expires_at,
            ipAddress,
            matchFoundAt: i + 1,
            totalComparisons: i + 1,
            verificationSuccess: true,
          })
          break
        } else {
          console.log(`🔴 [reset-password-validate::no-match-${i}] No match for token ${i + 1}`, {
            tokenId: tokenRow.id,
            userId: tokenRow.user_id,
            comparisonResult: "NO_MATCH",
            continuingToNext: i < result.length - 1,
          })
        }
      } catch (error) {
        console.log(
          `🔴 [reset-password-validate::token-verification-error-${i}] Token verification failed with error`,
          {
            tokenId: tokenRow.id,
            error: (error as Error).message,
            errorStack: (error as Error).stack,
            ipAddress,
            comparisonNumber: i + 1,
            continuingToNext: true,
          },
        )
        continue
      }
    }

    const verificationDuration = Date.now() - verificationStartTime
    console.log(
      "🔵 [reset-password-validate::token-verification] Timer ended - Duration: " + verificationDuration + "ms",
      {
        duration: verificationDuration,
        totalTokensChecked: result.length,
        matchFound: !!validTokenData,
      },
    )

    if (!validTokenData) {
      console.log("🔴 [reset-password-validate::token-not-found] No matching token found in database", {
        ipAddress,
        tokenLength: token.length,
        activeTokensChecked: result.length,
        inputTokenPreview: token.substring(0, 20) + "...",
        reason: "All bcrypt comparisons returned false",
        possibleIssues: [
          "Token was not generated by this system",
          "Token format mismatch",
          "Database contains wrong hash",
          "bcrypt comparison logic error",
        ],
      })

      return NextResponse.json(
        {
          valid: false,
          error: "Invalid or expired token",
        },
        { status: 400 },
      )
    }

    // Check if token is expired (additional safety check)
    const expiryStartTime = Date.now()
    console.log("🔵 [reset-password-validate::expiry-check-start] Starting additional expiry check", {
      tokenId: validTokenData.id,
      expiresAt: validTokenData.expires_at,
      currentTime: new Date().toISOString(),
    })

    const isExpired = isTokenExpired(validTokenData.expires_at)
    const expiryDuration = Date.now() - expiryStartTime

    console.log("🔵 [reset-password-validate::expiry-check] Timer ended - Duration: " + expiryDuration + "ms", {
      duration: expiryDuration,
      isExpired: isExpired,
      tokenId: validTokenData.id,
    })

    if (isExpired) {
      console.log("🔴 [reset-password-validate::token-expired] Token found but expired", {
        ipAddress,
        tokenId: validTokenData.id,
        userId: validTokenData.user_id,
        expiresAt: validTokenData.expires_at,
        currentTime: new Date().toISOString(),
        expiredBy: "Additional safety check detected expiration",
      })

      return NextResponse.json(
        {
          valid: false,
          error: "This password reset link has expired. Please request a new one.",
        },
        { status: 400 },
      )
    }

    // Token is valid - SUCCESS!
    const totalDuration = Date.now() - startTime
    console.log("🔵 [reset-password-validate::total-request] Timer ended - Duration: " + totalDuration + "ms", {
      duration: totalDuration,
    })

    console.log("✅ [reset-password-validate::validation-successful] Token validation successful", {
      tokenId: validTokenData.id,
      userId: validTokenData.user_id,
      ipAddress,
      processingTime: Date.now() - startTime,
      totalDuration,
      expiresAt: validTokenData.expires_at,
      timestamp: new Date().toISOString(),
      validationSteps: [
        "format-validation: PASSED",
        "database-lookup: FOUND_TOKENS",
        "token-verification: MATCH_FOUND",
        "expiry-check: NOT_EXPIRED",
      ],
    })

    console.log(
      "⚡ [PERF][reset-password-validate] Token validation completed successfully (" + totalDuration + "ms)",
      {
        tokenId: validTokenData.id,
        userId: validTokenData.user_id,
        ipAddress,
        steps: ["format-validation", "database-lookup", "token-verification", "expiry-check"],
        performance: {
          formatValidation: formatDuration + "ms",
          databaseLookup: dbDuration + "ms",
          tokenVerification: verificationDuration + "ms",
          expiryCheck: expiryDuration + "ms",
          total: totalDuration + "ms",
        },
      },
    )

    return NextResponse.json({
      valid: true,
      userId: validTokenData.user_id,
      tokenId: validTokenData.id,
      expiresAt: validTokenData.expires_at,
    })
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error("🔴 [reset-password-validate::unexpected-error] Unexpected error in token validation endpoint", {
      error: (error as Error).message,
      errorStack: (error as Error).stack,
      errorName: (error as Error).name,
      ipAddress,
      processingTime: totalDuration,
      timestamp: new Date().toISOString(),
      requestDetails: {
        method: "POST",
        url: request.url,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json(
      {
        valid: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  console.log("🔴 [reset-password-validate::method-not-allowed] GET method attempted on token validation endpoint", {
    timestamp: new Date().toISOString(),
    allowedMethods: ["POST"],
  })
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  console.log("🔴 [reset-password-validate::method-not-allowed] PUT method attempted on token validation endpoint", {
    timestamp: new Date().toISOString(),
    allowedMethods: ["POST"],
  })
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  console.log("🔴 [reset-password-validate::method-not-allowed] DELETE method attempted on token validation endpoint", {
    timestamp: new Date().toISOString(),
    allowedMethods: ["POST"],
  })
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
