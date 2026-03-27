import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TRUST_SHARE_SECTIONS } from "@/lib/trust-share-mapping"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ======================
// GET: Fetch Preferences
// ======================
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's share details
    const { data: sharingData, error } = await supabase
      .from("user_share_details")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("[GET user_share_details] Error:", error)
      throw error
    }

    return NextResponse.json({
      success: true,
      sections: TRUST_SHARE_SECTIONS,
      sharingData: sharingData || [],
    })
  } catch (err) {
    console.error("[GET user_share_details] Error:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// ==========================
// POST: Save/Update Sharing
// ==========================
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ success: false, message: "Invalid input format" }, { status: 400 })
    }

    const { recipientEmail, fields } = body

    if (!recipientEmail) {
      return NextResponse.json({ success: false, message: "Recipient email required" }, { status: 400 })
    }

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ success: false, message: "Fields selection required" }, { status: 400 })
    }

    // Build share data object
    const shareData: Record<string, any> = {
      user_id: user.id,
      trustshare_email_id: recipientEmail,
    }

    // Add all field selections as "true" or "false" strings (TEXT columns)
    TRUST_SHARE_SECTIONS.forEach((section) => {
      section.fields.forEach((field) => {
        shareData[field] = fields[field] ? "true" : "false"
      })
    })

    // Upsert - insert or update if exists (based on user_id + trustshare_email_id unique constraint)
    const { error } = await supabase
      .from("user_share_details")
      .upsert(shareData, { 
        onConflict: "user_id,trustshare_email_id"
      })

    if (error) throw error

    return NextResponse.json({ success: true, message: "Sharing preferences saved" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error in POST /save-preferences:", err)
    return NextResponse.json({ success: false, message: "Server error", error: message }, { status: 500 })
  }
}

// ===========================
// DELETE: Remove Shared Entry
// ===========================
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { recipientEmail } = body

    if (recipientEmail) {
      // Delete specific sharing entry
      const { error } = await supabase
        .from("user_share_details")
        .delete()
        .eq("user_id", user.id)
        .eq("trustshare_email_id", recipientEmail)

      if (error) throw error
    } else {
      // Delete all sharing entries for user
      const { error } = await supabase
        .from("user_share_details")
        .delete()
        .eq("user_id", user.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true, message: "Sharing preferences deleted" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error in DELETE /save-preferences:", err)
    return NextResponse.json({ success: false, message: "Server error", error: message }, { status: 500 })
  }
}
