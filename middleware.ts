import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
          Object.entries(headers ?? {}).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value as string)
          })
        },
      },
    },
  )

  // Debug logging - check what cookies are present
  const cookieNames = request.cookies.getAll().map(c => c.name)
  console.log('[Middleware]', request.nextUrl.pathname, '| Cookies:', cookieNames.join(', ') || 'none')

  // Validate JWT locally (fast, no network call)
  const { data } = await supabase.auth.getClaims()
  const isAuthed = !!data?.claims

  console.log('[Middleware]', request.nextUrl.pathname, '| Authenticated:', isAuthed)

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !isAuthed) {
    console.log('[Middleware] Redirecting unauthenticated user to /login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auth pages - redirect to dashboard if already authenticated
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname === path
  )

  if (isAuthPath && isAuthed) {
    console.log('[Middleware] Redirecting authenticated user to /dashboard')
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Cache-Control headers for protected and auth routes
  const noStorePaths = ['/dashboard', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback', '/api/auth']
  const needsNoStore = noStorePaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (needsNoStore) {
    supabaseResponse.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
  }

  // Security headers
  supabaseResponse.headers.set("X-Frame-Options", "DENY")
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff")
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  supabaseResponse.headers.set("X-DNS-Prefetch-Control", "off")
  supabaseResponse.headers.set("X-Download-Options", "noopen")
  supabaseResponse.headers.set("X-Permitted-Cross-Domain-Policies", "none")
  supabaseResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  supabaseResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin")

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://vercel.live`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com https://*.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
  supabaseResponse.headers.set("Content-Security-Policy", csp)

  // HSTS for production
  if (process.env.NODE_ENV === "production") {
    supabaseResponse.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  // Permissions Policy
  const permissionsPolicy = [
    "camera=()", "microphone=()", "geolocation=()", "interest-cohort=()",
    "payment=()", "usb=()", "bluetooth=()", "accelerometer=()", "gyroscope=()", "magnetometer=()",
  ].join(", ")
  supabaseResponse.headers.set("Permissions-Policy", permissionsPolicy)

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
