import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const trimmedEmail = email.trim().toLowerCase()

    // Check if user is trying to share with themselves
    if (trimmedEmail === user.email?.toLowerCase()) {
      return NextResponse.json({ success: false, message: "You cannot share with yourself" }, { status: 400 })
    }

    // Check if email exists in registered_users table (email_id is text[] array)
    console.log("[validate-email] Searching for email:", trimmedEmail)
    
    const { data: userData, error: userError } = await supabase
      .from("registered_users")
      .select("email_id")
      .contains("email_id", [trimmedEmail])
      .single()

    if (userData) {
      console.log("[validate-email] ✅ Email found - user is registered")
    } else {
      console.log("[validate-email] ❌ Email not found -", userError?.message || "user not registered")
    }

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        message: "User not registered. Please enter a valid registered email."
      }, { status: 404 })
    }

    // User found - return success with user info
    return NextResponse.json({
      success: true,
      message: "User found",
      recipient: {
        id: trimmedEmail,
        email: trimmedEmail,
        name: "User"
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error in POST /validate-email:", err)
    return NextResponse.json({ success: false, message: "Server error", error: message }, { status: 500 })
  }
}
