import { redirect } from "next/navigation"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import ProcessSection from "@/components/process-section"
import CallToActionSection from "@/components/call-to-action-section"
import { createClient } from "@/lib/supabase/server"

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
      // Auth failed, redirect to login with error
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }
  }
  
  // Handle auth errors
  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error_description || params.error)}`)
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
