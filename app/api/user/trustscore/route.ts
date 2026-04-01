import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user directly from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user details from the user_details table
    const { data: userDetails, error: detailsError } = await supabase
      .from("user_details")
      .select("*")
      .eq("user_id", user.id)
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
          email_id: user.email,
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
