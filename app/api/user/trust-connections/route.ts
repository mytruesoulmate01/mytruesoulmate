import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TRUST_SHARE_SECTIONS } from "@/lib/trust-share-mapping"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// Get all shareable field names from TRUST_SHARE_SECTIONS
const ALL_SHARE_FIELDS = TRUST_SHARE_SECTIONS.flatMap((section) => section.fields)

// ===========================
// GET: Trust Connections Data
// Fetches details that OTHER users have shared WITH the logged-in user
// ===========================
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loggedInEmail = user.email?.toLowerCase()
    if (!loggedInEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    console.log("[Trust Connections] Fetching shares for:", loggedInEmail)

    // Get all rows from user_share_details where trustshare_email_id = logged-in user's email
    // These are details that OTHER users have shared WITH the logged-in user
    const { data: sharedWithMe, error: sharedError } = await supabase
      .from("user_share_details")
      .select("*")
      .eq("trustshare_email_id", loggedInEmail)

    if (sharedError) {
      console.error("[Trust Connections] Error fetching shared with me:", sharedError)
      return NextResponse.json({ 
        success: false, 
        message: "Error fetching shared data", 
        error: sharedError.message 
      }, { status: 500 })
    }

    console.log("[Trust Connections] Found", sharedWithMe?.length || 0, "shares")

    // For each share entry, get the sharer's email and include shared field flags
    const sharedWithMeData = []

    for (const shareEntry of (sharedWithMe || [])) {
      const sharerId = shareEntry.user_id // The user who shared their details

      // Get the sharer's email from user_details
      const { data: sharerProfile, error: profileError } = await supabase
        .from("user_details")
        .select("email_id")
        .eq("user_id", sharerId)
        .single()

      // Build the shared data object with field flags (true/false)
      const sharedData: { [key: string]: any } = {
        person_email: sharerProfile?.email_id?.[0] || sharerId, // Email of person who shared
        sharer_id: sharerId,
      }

      // For each field, include the shared flag ("true" or "false")
      ALL_SHARE_FIELDS.forEach((field) => {
        sharedData[field] = shareEntry[field] === "true" || shareEntry[field] === true
      })

      sharedWithMeData.push(sharedData)
    }

    return NextResponse.json({
      success: true,
      sharedWithMe: sharedWithMeData,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[Trust Connections] Error:", err)
    return NextResponse.json({ success: false, message: "Server error", error: message }, { status: 500 })
  }
}

// ===========================
// POST: Refresh connection data (no-op, just triggers a refresh)
// ===========================
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Just return success - the GET will fetch fresh data
    return NextResponse.json({ success: true, message: "Refresh triggered" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[Trust Connections] POST Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to process request", error: message },
      { status: 500 }
    )
  }
}
