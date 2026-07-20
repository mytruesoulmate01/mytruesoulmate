import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side token exchange endpoint for PKCE email flows
 * Handles: password recovery, email verification, magic links
 * 
 * This endpoint receives token_hash from Supabase email links,
 * verifies it server-side, establishes the session via cookies,
 * then redirects to the intended page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
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
      // Successfully verified - redirect to intended page
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
    
    console.error('[Auth Confirm] Verification error:', error.message)
  }

  // Verification failed - redirect to error page
  return NextResponse.redirect(`${origin}/auth/error?error=verification_failed`)
}
