import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileClient from "./profile-client"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // Use getClaims() - faster than getUser(), no network call
  const { data, error } = await supabase.auth.getClaims()
  
  // Validate claims exist
  if (error || !data?.claims) {
    redirect("/login")
  }

  // Validate user ID specifically
  const userId = data.claims.sub
  if (!userId) {
    redirect("/login")
  }

  // Safely extract email (not guaranteed in all JWT setups)
  const email = typeof data.claims.email === "string" ? data.claims.email : undefined

  // Fetch profile using same client (reused)
  const { data: profile, error: profileError } = await supabase
    .from("user_details")
    .select("*")
    .eq("user_id", userId)
    .single()

  // Log only unexpected errors (not "row not found")
  if (profileError && profileError.code !== "PGRST116") {
    console.error("[ProfilePage] Error fetching profile:", profileError)
  }

  return (
    <ProfileClient 
      profile={
        profile
          ? { ...profile, ...(email ? { email_id: email } : {}) }
          : null
      } 
    />
  )
}
