import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that require authentication check
const PROTECTED_PATHS = ['/dashboard']
const AUTH_PAGES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Determine if this path needs auth checking
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  const isAuthPage = AUTH_PAGES.some(path => pathname === path)
  const needsAuthCheck = isProtectedPath || isAuthPage

  // PUBLIC PAGES: Skip auth entirely - return immediately for best performance
  if (!needsAuthCheck) {
    return NextResponse.next()
  }

  // AUTH-REQUIRED PAGES: Create Supabase client and validate session
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

  // Validate JWT (fast local verification when asymmetric keys are used)
  const { data } = await supabase.auth.getClaims()
  const isAuthed = !!data?.claims

  // Helper: Create redirect response and preserve Supabase cookies
  const createRedirectWithCookies = (redirectUrl: URL) => {
    const redirectResponse = NextResponse.redirect(redirectUrl)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Protected routes - redirect to login if not authenticated
  if (isProtectedPath && !isAuthed) {
    const url = request.nextUrl.clone()
    url.search = '' // Clear existing query params
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname + search)
    return createRedirectWithCookies(url)
  }

  // Auth pages - redirect to profile if already authenticated
  if (isAuthPage && isAuthed) {
    const url = request.nextUrl.clone()
    url.search = '' // Clear existing query params
    url.pathname = '/dashboard/profile'
    return createRedirectWithCookies(url)
  }

  // Cache-Control headers for auth-related routes (prevent back-button caching)
  supabaseResponse.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  supabaseResponse.headers.set('Pragma', 'no-cache')
  supabaseResponse.headers.set('Expires', '0')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
}
