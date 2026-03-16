import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { withSupabaseAuth, type SupabaseUser } from "@/lib/supabase/auth-middleware"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export const GET = withSupabaseAuth(async (_req: NextRequest, user: SupabaseUser) => {
  console.log(`[API][Trustscore] Request received for user_id: ${user.id}`)

  try {
    const supabase = await createClient()

    // Fetch user details from the user_details table
    const { data: userDetails, error: detailsError } = await supabase
      .from("user_details")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (detailsError && detailsError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error(`[API][Trustscore] Error fetching user details:`, detailsError)
      throw detailsError
    }

    // Fetch trustscore data
    const { data: trustscoreData, error: trustscoreError } = await supabase
      .from("trustscore")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (trustscoreError && trustscoreError.code !== "PGRST116") {
      console.error(`[API][Trustscore] Error fetching trustscore:`, trustscoreError)
      throw trustscoreError
    }

    // Build response with user details and trustscore
    const userData = userDetails || {}
    const trustscore = trustscoreData || {
      total_score: 0,
      score_percentage: 0,
      trust_level: "unverified",
      identity_verified: false,
      education_verified: false,
      employment_verified: false,
      address_verified: false,
      social_verified: false,
      background_verified: false,
    }

    console.log(`[API][Trustscore] Data fetched successfully for user: ${user.id}`)

    return NextResponse.json(
      {
        success: true,
        user: {
          ...userData,
          email: user.email,
        },
        trustscore,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`[API][Trustscore] Error:`, error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
})
