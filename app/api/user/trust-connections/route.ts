import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-middleware"
import { sql } from "@/lib/db"
import type { JWTPayload } from "@/lib/jwt"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ===========================
// GET: Data Shared With User
// ===========================

export const GET = withAuth(async (_req: NextRequest, user: JWTPayload) => {
  try {
    // ✅ Log the logged-in user info
    console.log("🔐 Logged-in User ID (user.sub):", user.sub)
    console.log("📧 Logged-in User Email (user.email):", user.email)

    console.log("🔍 Executing query: SELECT * FROM user_share_details WHERE recipient_email =", user.email)

    const sharedData = await sql`
      SELECT * FROM user_share_details
      WHERE recipient_email = ${user.email}
    `

    console.log("📊 Raw query result count:", sharedData.length)
    console.log("📋 Raw query result:", JSON.stringify(sharedData, null, 2))

    const allRecords = await sql`SELECT COUNT(*) as total FROM user_share_details`
    console.log("📈 Total records in user_share_details table:", allRecords[0]?.total)

    const similarEmails = await sql`
      SELECT recipient_email, user_email FROM user_share_details 
      WHERE recipient_email LIKE '%aryan%' OR user_email LIKE '%aryan%'
    `
    console.log("🔎 Records with 'aryan' in email:", similarEmails)

    const filteredData = sharedData.map(({ details_shared, ...rest }) => rest)

    if (filteredData.length === 0) {
      console.log("❌ No records found shared with this user.")
      return NextResponse.json({ success: false, message: "No data shared with you" }, { status: 404 })
    }

    console.log("✅ Records shared with logged-in user:", filteredData)

    return NextResponse.json({
      success: true,
      sharedWithMe: filteredData,
    })
  } catch (err: any) {
    console.error("❌ Error in GET /api/shared-with-me:", err)
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 })
  }
})

// ===========================
// POST: Update Timestamp Only
// ===========================
export const POST = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    console.log("🕒 Updating details_shared for user:", user.sub)

    const result = await sql`
      UPDATE user_share_details
      SET details_shared = CURRENT_TIMESTAMP
      WHERE user_id = ${user.sub}
    `

    return NextResponse.json({
      success: true,
      message: "details_shared timestamp updated successfully",
    })
  } catch (err: any) {
    console.error("❌ Error in POST /api/trust-connections:", err)
    return NextResponse.json(
      { success: false, message: "Failed to update timestamp", error: err.message },
      { status: 500 },
    )
  }
})
