import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Download-Options", "noopen")
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none")
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin")

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
  response.headers.set("Content-Security-Policy", csp)

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  const permissionsPolicy = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "payment=()",
    "usb=()",
    "bluetooth=()",
    "accelerometer=()",
    "gyroscope=()",
    "magnetometer=()",
  ].join(", ")
  response.headers.set("Permissions-Policy", permissionsPolicy)

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method)

    if (!isSafeMethod) {
      const origin = request.headers.get("origin")
      const referer = request.headers.get("referer")
      const host = request.headers.get("host")

      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`, // For development
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
      ].filter(Boolean)

      if (!origin || !allowedOrigins.includes(origin)) {
        console.log("[v0] Origin validation failed:", { origin, allowedOrigins })
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
      }

      if (!referer || !allowedOrigins.some((allowed) => referer.startsWith(allowed))) {
        console.log("[v0] Referer validation failed:", { referer, allowedOrigins })
        return NextResponse.json({ error: "Invalid referer" }, { status: 403 })
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
