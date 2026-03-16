import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { withSupabaseAuth, type SupabaseUser } from "@/lib/supabase/auth-middleware"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ===========================
// GET: Trust Connections Data
// ===========================
export const GET = withSupabaseAuth(async (_req: NextRequest, user: SupabaseUser) => {
  try {
    const supabase = await createClient()

    console.log("[Trust Connections] Fetching for user:", user.id)

    // Get connections where this user is the recipient
    const { data: sharedWithMe, error: sharedError } = await supabase
      .from("trust_connections")
      .select(`
        *,
        sender:user_details!trust_connections_sender_user_id_fkey(
          full_name,
          email,
          profile_image_url
        )
      `)
      .eq("recipient_user_id", user.id)
      .eq("status", "accepted")

    if (sharedError) {
      console.error("[Trust Connections] Error fetching shared with me:", sharedError)
    }

    // Get connections where this user is the sender
    const { data: sharedByMe, error: byMeError } = await supabase
      .from("trust_connections")
      .select(`
        *,
        recipient:user_details!trust_connections_recipient_user_id_fkey(
          full_name,
          email,
          profile_image_url
        )
      `)
      .eq("sender_user_id", user.id)

    if (byMeError) {
      console.error("[Trust Connections] Error fetching shared by me:", byMeError)
    }

    // Get pending connection requests for this user
    const { data: pendingRequests, error: pendingError } = await supabase
      .from("trust_connections")
      .select(`
        *,
        sender:user_details!trust_connections_sender_user_id_fkey(
          full_name,
          email,
          profile_image_url
        )
      `)
      .eq("recipient_user_id", user.id)
      .eq("status", "pending")

    if (pendingError) {
      console.error("[Trust Connections] Error fetching pending requests:", pendingError)
    }

    return NextResponse.json({
      success: true,
      sharedWithMe: sharedWithMe || [],
      sharedByMe: sharedByMe || [],
      pendingRequests: pendingRequests || [],
    })
  } catch (err: any) {
    console.error("[Trust Connections] Error:", err)
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 })
  }
})

// ===========================
// POST: Create/Update Connection
// ===========================
export const POST = withSupabaseAuth(async (req: NextRequest, user: SupabaseUser) => {
  try {
    const body = await req.json()
    const { recipientEmail, action } = body
    const supabase = await createClient()

    if (!recipientEmail) {
      return NextResponse.json({ success: false, message: "Recipient email required" }, { status: 400 })
    }

    // Find recipient user
    const { data: recipient, error: recipientError } = await supabase
      .from("user_details")
      .select("user_id, email")
      .eq("email", recipientEmail)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json(
        { success: false, message: "Recipient not found" },
        { status: 404 }
      )
    }

    if (recipient.user_id === user.id) {
      return NextResponse.json(
        { success: false, message: "Cannot connect with yourself" },
        { status: 400 }
      )
    }

    // Check for existing connection
    const { data: existing } = await supabase
      .from("trust_connections")
      .select("id, status")
      .or(`and(sender_user_id.eq.${user.id},recipient_user_id.eq.${recipient.user_id}),and(sender_user_id.eq.${recipient.user_id},recipient_user_id.eq.${user.id})`)
      .single()

    if (existing && existing.status === "accepted") {
      return NextResponse.json(
        { success: false, message: "Connection already exists" },
        { status: 400 }
      )
    }

    if (action === "request") {
      // Create new connection request
      const { error: insertError } = await supabase
        .from("trust_connections")
        .insert({
          sender_user_id: user.id,
          recipient_user_id: recipient.user_id,
          status: "pending",
        })

      if (insertError) throw insertError

      return NextResponse.json({ success: true, message: "Connection request sent" })
    }

    if (action === "accept" && existing) {
      const { error: updateError } = await supabase
        .from("trust_connections")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", existing.id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, message: "Connection accepted" })
    }

    if (action === "decline" && existing) {
      const { error: updateError } = await supabase
        .from("trust_connections")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", existing.id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, message: "Connection declined" })
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    console.error("[Trust Connections] POST Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to process request", error: err.message },
      { status: 500 }
    )
  }
})

// ===========================
// DELETE: Remove Connection
// ===========================
export const DELETE = withSupabaseAuth(async (req: NextRequest, user: SupabaseUser) => {
  try {
    const body = await req.json()
    const { connectionId } = body
    const supabase = await createClient()

    if (!connectionId) {
      return NextResponse.json({ success: false, message: "Connection ID required" }, { status: 400 })
    }

    // Delete connection (only if user is part of it)
    const { error } = await supabase
      .from("trust_connections")
      .delete()
      .eq("id", connectionId)
      .or(`sender_user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Connection removed" })
  } catch (err: any) {
    console.error("[Trust Connections] DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to remove connection", error: err.message },
      { status: 500 }
    )
  }
})
