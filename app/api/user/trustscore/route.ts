import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Use getClaims() - faster than getUser(), no network call
    const { data, error: authError } = await supabase.auth.getClaims()
    
    if (authError || !data?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = data.claims.sub
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const email = typeof data.claims.email === "string" ? data.claims.email : undefined

    // Fetch user details from the user_details table
    const { data: userDetails, error: detailsError } = await supabase
      .from("user_details")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (detailsError && detailsError.code !== "PGRST116") {
      console.error("[API][Trustscore] Error fetching user details:", detailsError)
      throw detailsError
    }

    // Build response with user details
    const userData = userDetails || {}

    return NextResponse.json(
      {
        success: true,
        user: {
          ...userData,
          ...(email ? { email_id: email } : {}),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API][Trustscore] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
