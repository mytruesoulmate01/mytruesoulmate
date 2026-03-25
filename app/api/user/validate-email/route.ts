import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// POST: Validate if email exists using Supabase Edge Function
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

    // Check if email exists using Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.check_email_api_key

    if (!supabaseUrl || !apiKey) {
      console.error("Missing environment variables for email check")
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 })
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/check-email`
    
    console.log("Calling Edge Function:", edgeFunctionUrl)
    console.log("Email to check:", trimmedEmail)
    
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ email: trimmedEmail }),
    })

    const result = await response.json()
    
    console.log("Edge Function response status:", response.status)
    console.log("Edge Function result:", result)

    if (!response.ok || !result.exists) {
      return NextResponse.json({ 
        success: false, 
        message: "User not registered. Please enter a valid registered email.",
        debug: { status: response.status, result }
      }, { status: 404 })
    }

    // User found - get additional details from user_details if available
    const { data: userDetails } = await supabase
      .from("user_details")
      .select("full_name, user_id")
      .eq("email", trimmedEmail)
      .single()

    return NextResponse.json({
      success: true,
      message: "User found",
      recipient: {
        id: userDetails?.user_id || trimmedEmail,
        email: trimmedEmail,
        name: userDetails?.full_name || "User"
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error in POST /validate-email:", err)
    return NextResponse.json({ success: false, message: "Server error", error: message }, { status: 500 })
  }
}
