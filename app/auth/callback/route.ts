import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sanitizeErrorForUrl } from '@/lib/auth-errors'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin } = requestUrl
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Validate redirect path to prevent open redirect attacks
  // Only allow internal paths that start with / but not // (protocol-relative URLs)
  const isValidRedirect = nextParam.startsWith('/') && 
                          !nextParam.startsWith('//') && 
                          !nextParam.includes(':')
  const next = isValidRedirect ? nextParam : '/dashboard'

  // Handle error from Supabase 
  if (error) {
    // Log full error server-side for debugging
    console.error('[Auth Callback] Error:', { error, errorDescription, url: request.url })
    
    // Sanitize for client - prefer error code, fallback to description
    let safeErrorCode = sanitizeErrorForUrl(error)
    if (safeErrorCode === 'unknown' && errorDescription) {
      safeErrorCode = sanitizeErrorForUrl(errorDescription)
    }
    
    const redirectUrl = new URL('/login', origin)
    redirectUrl.searchParams.set('error', safeErrorCode)
    return NextResponse.redirect(redirectUrl, { headers: noStoreHeaders })
  }

  if (code) {
    const supabase = await createClient()
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Wait for database trigger to complete (creates user_details row on signup)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Successfully exchanged code for session
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // In development, redirect to localhost
        return NextResponse.redirect(`${origin}${next}`, { headers: noStoreHeaders })
      } else if (forwardedHost) {
        // In production with load balancer
        return NextResponse.redirect(`https://${forwardedHost}${next}`, { headers: noStoreHeaders })
      } else {
        return NextResponse.redirect(`${origin}${next}`, { headers: noStoreHeaders })
      }
    }
    
    // Log full error server-side for debugging
    console.error('[Auth Callback] Code exchange error:', {
      code: exchangeError.code,
      message: exchangeError.message,
      name: exchangeError.name,
    })
    
    // Sanitize for client
    const safeErrorCode = sanitizeErrorForUrl(exchangeError)
    const redirectUrl = new URL('/login', origin)
    redirectUrl.searchParams.set('error', safeErrorCode)
    return NextResponse.redirect(redirectUrl, { headers: noStoreHeaders })
  }

  // No code provided - redirect to error page
  return NextResponse.redirect(
    `${origin}/auth/error?error=auth_callback_error`,
    { headers: noStoreHeaders }
  )
}
