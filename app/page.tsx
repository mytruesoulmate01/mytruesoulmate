import { redirect } from "next/navigation"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import ProcessSection from "@/components/process-section"
import CallToActionSection from "@/components/call-to-action-section"
import { createClient } from "@/lib/supabase/server"
import { sanitizeErrorForUrl } from "@/lib/auth-errors"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}) {
  const params = await searchParams
  
  // If there's an auth code in the URL, exchange it for a session
  if (params.code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    
    if (!error) {
      // Successfully authenticated, redirect to dashboard
      redirect('/dashboard')
    } else {
      // Log full error server-side for debugging
      console.error('[Home] Auth code exchange error:', { code: error.code, message: error.message })
      // Sanitize for client - never expose raw error
      const safeErrorCode = sanitizeErrorForUrl(error)
      redirect(`/login?error=${safeErrorCode}`)
    }
  }
  
  // Handle auth errors from Supabase redirect
  if (params.error) {
    // Log full error server-side for debugging
    console.error('[Home] Auth error:', { error: params.error, description: params.error_description })
    // Sanitize for client - prefer error code, fallback to description
    let safeErrorCode = sanitizeErrorForUrl(params.error)
    if (safeErrorCode === 'unknown' && params.error_description) {
      safeErrorCode = sanitizeErrorForUrl(params.error_description)
    }
    redirect(`/login?error=${safeErrorCode}`)
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <CallToActionSection />
    </div>
  )
}
