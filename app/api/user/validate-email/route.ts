import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sanitizeRecipientEmail } from "@/lib/sanitization"

export const dynamic = "force-dynamic"

// POST: Validate if email exists in user_details table
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if current user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Sanitize email to prevent XSS and SQL injection
    let sanitizedEmail: string
    try {
      sanitizedEmail = sanitizeRecipientEmail(email)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Check if user is trying to share with themselves
    if (sanitizedEmail === user.email?.toLowerCase()) {
      return NextResponse.json({ success: false, message: "You cannot share with yourself" }, { status: 400 })
    }

    // Check if email exists in registered_users table (email_id is text, user_id is uuid)
    if (process.env.NODE_ENV === 'development') {
      console.log("[validate-email] Searching for email:", sanitizedEmail)
    }
    
    const { data: userData, error: userError } = await supabase
      .from("registered_users")
      .select("email_id, user_id")
      .eq("email_id", sanitizedEmail)
      .single()

    if (process.env.NODE_ENV === 'development') {
      if (userData) {
        console.log("[validate-email] ✅ Email found - user is registered")
      } else {
        console.log("[validate-email] ❌ Email not found -", userError?.message || "user not registered")
      }
    }

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        message: "User not registered. Please enter a valid registered email."
      }, { status: 404 })
    }

    // Check if share already exists in trustshare_details
    const { data: existingShare } = await supabase
      .from("trustshare_details")
      .select("trustshare_email_id")
      .eq("user_id", user.id)
      .eq("trustshare_email_id", sanitizedEmail)
      .single()

    if (existingShare) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[validate-email] ⚠️ Share already exists for this recipient")
      }
      return NextResponse.json({ 
        success: false, 
        message: "You have already shared your details with this user. Please edit your existing share from the list below."
      }, { status: 409 })
    }

    // User found and no existing share - return success with user info
    return NextResponse.json({
      success: true,
      message: "User found",
      recipient: {
        id: sanitizedEmail,
        email: sanitizedEmail,
        name: "User"
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error in POST /validate-email:", err)
    return NextResponse.json({ success: false, message: "Server error", error: message }, { status: 500 })
  }
}
