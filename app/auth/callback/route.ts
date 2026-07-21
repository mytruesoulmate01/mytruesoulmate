import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
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
    console.error('[Auth Callback] Error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`,
      { headers: noStoreHeaders }
    )
  }

  if (code) {
    const supabase = await createClient()
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
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
    
    console.error('[Auth Callback] Code exchange error:', exchangeError.message)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/auth/error?error=auth_callback_error`,
    { headers: noStoreHeaders }
  )
}
