import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, extractJWTFromCookies, type JWTPayload } from "./jwt"
import { getUserByIdWithRole } from "./db"

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Middleware to verify JWT authentication
 */
export async function authenticateJWT(request: NextRequest): Promise<{
  isAuthenticated: boolean
  user?: JWTPayload
  response?: NextResponse
}> {
  try {
    // Extract token from cookies
    const token = extractJWTFromCookies(request.headers.get("cookie"))
    console.log("🔐 Extracted JWT Token:", token) // ✅ Add this line

    if (!token) {
      console.log("🔵 [AUTH::NO_TOKEN] No auth token found", {
        pathname: request.nextUrl.pathname,
        method: request.method,
        note: "Expected behavior for unauthenticated users",
      })
      return {
        isAuthenticated: false,
        response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
      }
    }

    // Verify token
    const payload = await verifyJWT(token)
    console.log("📦 Decoded JWT Payload:", JSON.stringify(payload, null, 2)) // ✅ Add this

    if (!payload) {
      console.log("🔴 [AUTH::INVALID_TOKEN] Token verification failed", {
        pathname: request.nextUrl.pathname,
        method: request.method,
      })
      return {
        isAuthenticated: false,
        response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
      }
    }

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      console.log("🔴 [AUTH::TOKEN_EXPIRED] Token expired", {
        exp: payload.exp,
        now: currentTime,
        pathname: request.nextUrl.pathname,
        method: request.method,
      })
      return {
        isAuthenticated: false,
        response: NextResponse.json({ error: "Token expired" }, { status: 401 }),
      }
    }

    if (payload.tokenVersion && payload.sub) {
      try {
        const user = await getUserByIdWithRole(payload.sub)
        if (!user || user.token_version !== payload.tokenVersion) {
          console.log("🔴 [AUTH::TOKEN_VERSION_MISMATCH] Token version invalid", {
            tokenVersion: payload.tokenVersion,
            currentVersion: user?.token_version,
            userId: payload.sub,
            pathname: request.nextUrl.pathname,
          })
          return {
            isAuthenticated: false,
            response: NextResponse.json({ error: "Session invalidated" }, { status: 401 }),
          }
        }
      } catch (dbError) {
        console.error("🔴 [AUTH::DB_ERROR] Database error during token validation:", dbError)
        return {
          isAuthenticated: false,
          response: NextResponse.json({ error: "Authentication validation failed" }, { status: 500 }),
        }
      }
    }

    console.log("🟢 [AUTH::SUCCESS] Authentication successful", {
      userId: payload.sub,
      email: payload.email,
      tokenVersion: payload.tokenVersion,
      pathname: request.nextUrl.pathname,
      method: request.method,
    })

    return {
      isAuthenticated: true,
      user: payload as JWTPayload,
    }
  } catch (error) {
    console.error("🔴 [AUTH::ERROR] Authentication middleware error:", error, {
      pathname: request.nextUrl.pathname,
      method: request.method,
      errorType: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    })

    // Check if error is related to JWT configuration
    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      console.error("🚨 [SECURITY] JWT configuration error - check environment variables")
      return {
        isAuthenticated: false,
        response: NextResponse.json({ error: "Server configuration error" }, { status: 500 }),
      }
    }

    return {
      isAuthenticated: false,
      response: NextResponse.json({ error: "Authentication failed" }, { status: 500 }),
    }
  }
}

/**
 * Create protected route handler
 */
export function withAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await authenticateJWT(request)

    if (!authResult.isAuthenticated || !authResult.user) {
      return authResult.response!
    }

    return handler(request, authResult.user)
  }
}

/**
 * Extract user from authenticated request
 */
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  const authResult = await authenticateJWT(request)
  return authResult.isAuthenticated ? authResult.user! : null
}

/**
 * Verify authentication token (alias for authenticateJWT for backward compatibility)
 */
export async function verifyAuthToken(request: NextRequest): Promise<{
  isAuthenticated: boolean
  user?: JWTPayload
  response?: NextResponse
}> {
  return authenticateJWT(request)
}
