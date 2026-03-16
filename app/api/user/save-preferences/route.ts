import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { withSupabaseAuth, type SupabaseUser } from "@/lib/supabase/auth-middleware"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ======================
// GET: Fetch Preferences
// ======================
export const GET = withSupabaseAuth(async (_req: NextRequest, user: SupabaseUser) => {
  try {
    const supabase = await createClient()

    // Get user's share details
    const { data: sharingData, error } = await supabase
      .from("user_share_details")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("[GET user_share_details] Error:", error)
      throw error
    }

    // Define available fields for sharing
    const fields = [
      "share_enabled",
      "share_basic_info",
      "share_contact_info",
      "share_family_info",
      "share_education_info",
      "share_career_info",
      "share_photos",
      "share_trustscore",
      "share_verification_badges",
      "require_login_to_view",
      "allow_download",
      "watermark_photos",
      "hide_contact_until_connected",
    ]

    // If no data found for this user, return defaults
    let responseData = sharingData || []
    if (responseData.length === 0) {
      responseData = [{
        share_enabled: false,
        share_basic_info: true,
        share_contact_info: false,
        share_family_info: false,
        share_education_info: true,
        share_career_info: true,
        share_photos: true,
        share_trustscore: true,
        share_verification_badges: true,
        require_login_to_view: false,
        allow_download: false,
        watermark_photos: true,
        hide_contact_until_connected: true,
      }]
    }

    return NextResponse.json({
      success: true,
      fields,
      sharingData: responseData,
    })
  } catch (err) {
    console.error("[GET user_share_details] Error:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
})

// ==========================
// POST: Save/Update Sharing
// ==========================
export const POST = withSupabaseAuth(async (req: NextRequest, user: SupabaseUser) => {
  try {
    const body = await req.json()
    const supabase = await createClient()

    // Validate input
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ success: false, message: "Invalid input format" }, { status: 400 })
    }

    // Check if user already has share details
    const { data: existing } = await supabase
      .from("user_share_details")
      .select("id")
      .eq("user_id", user.id)
      .single()

    const shareData = {
      user_id: user.id,
      share_enabled: body.share_enabled ?? false,
      share_basic_info: body.share_basic_info ?? true,
      share_contact_info: body.share_contact_info ?? false,
      share_family_info: body.share_family_info ?? false,
      share_education_info: body.share_education_info ?? true,
      share_career_info: body.share_career_info ?? true,
      share_photos: body.share_photos ?? true,
      share_trustscore: body.share_trustscore ?? true,
      share_verification_badges: body.share_verification_badges ?? true,
      require_login_to_view: body.require_login_to_view ?? false,
      allow_download: body.allow_download ?? false,
      watermark_photos: body.watermark_photos ?? true,
      hide_contact_until_connected: body.hide_contact_until_connected ?? true,
      share_code: body.share_code || null,
      share_url: body.share_url || null,
      share_expires_at: body.share_expires_at || null,
      max_views: body.max_views || null,
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("user_share_details")
        .update(shareData)
        .eq("user_id", user.id)

      if (error) throw error
    } else {
      // Insert new record
      const { error } = await supabase
        .from("user_share_details")
        .insert(shareData)

      if (error) throw error
    }

    return NextResponse.json({ success: true, message: "Preferences updated" })
  } catch (err: any) {
    console.error("Error in POST /save-preferences:", err)
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 })
  }
})

// ===========================
// DELETE: Remove Shared Entry
// ===========================
export const DELETE = withSupabaseAuth(async (req: NextRequest, user: SupabaseUser) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("user_share_details")
      .delete()
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Sharing preferences deleted" })
  } catch (err: any) {
    console.error("Error in DELETE /save-preferences:", err)
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 })
  }
})
