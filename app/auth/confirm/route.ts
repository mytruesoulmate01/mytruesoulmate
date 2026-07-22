import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeErrorForUrl } from '@/lib/auth-errors'

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

/**
 * Server-side token exchange endpoint for PKCE email flows
 * Handles: password recovery, email verification, magic links
 * 
 * This endpoint receives token_hash from Supabase email links,
 * verifies it server-side, establishes the session via cookies,
 * then redirects to the intended page.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin } = requestUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  // Validate redirect path to prevent open redirect attacks
  const isValidRedirect = next.startsWith('/') && 
                          !next.startsWith('//') && 
                          !next.includes(':')
  const redirectPath = isValidRedirect ? next : '/'

  if (token_hash && type) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Wait for database trigger to complete (creates user_details row)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Successfully verified - redirect to intended page
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`, { headers: noStoreHeaders })
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`, { headers: noStoreHeaders })
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`, { headers: noStoreHeaders })
      }
    }
    
    // Log full error server-side for debugging
    console.error('[Auth Confirm] Verification error:', {
      code: error.code,
      message: error.message,
      name: error.name,
      type,
    })
    
    // Sanitize for client
    const safeErrorCode = sanitizeErrorForUrl(error)
    const redirectUrl = new URL('/login', origin)
    redirectUrl.searchParams.set('error', safeErrorCode)
    return NextResponse.redirect(redirectUrl, { headers: noStoreHeaders })
  }

  // Missing token or type - redirect to error page
  return NextResponse.redirect(
    `${origin}/auth/error?error=verification_failed`,
    { headers: noStoreHeaders }
  )
}
