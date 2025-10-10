import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-middleware"
import { sql, query } from "@/lib/db"
import type { JWTPayload } from "@/lib/jwt"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ======================
// GET: Fetch Preferences
// ======================
export const GET = withAuth(async (_req: NextRequest, user: JWTPayload) => {
  try {
    const columnQuery = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user_share_details'
      AND column_name NOT IN ('user_id', 'recipient_email', 'user_email', 'recipient_id', 'details_shared')
    `
    const fields = columnQuery.map((col: any) => col.column_name)

    const result = await sql`
      SELECT * FROM user_share_details WHERE user_id = ${user.sub}
    `

    let sharingData = result

    // 🆕 If no data found for this user, inject 1 empty default row
    if (sharingData.length === 0) {
      const defaultRow: Record<string, any> = {
        recipient_email: "",
      }
      for (const field of fields) {
        defaultRow[field] = false
      }
      sharingData = [defaultRow]
    }

    return NextResponse.json({
      success: true,
      fields,
      sharingData,
    })
  } catch (err) {
    console.error("[GET user_share_details] ❌ Error:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
})

// ==========================
// POST: Save/Update Sharing
// ==========================
export const POST = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    const body = await req.json()

    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "Invalid input format" }, { status: 400 })
    }

    if (body.length > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only share with up to 5 people.",
        },
        { status: 400 },
      )
    }

    console.log("📥 Incoming body:", body)

    for (const entry of body) {
      const { recipientEmail, ...fields } = entry
      const recipient_email = recipientEmail?.trim() ?? ""

      // ✅ Validate recipient exists and fetch recipient_id
      const recipientCheck = await sql`
        SELECT user_id FROM user_details WHERE email_id = ${recipient_email}
      `

      if (recipientCheck.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Recipient email ${recipient_email} does not exist in our records.`,
          },
          { status: 400 },
        )
      }

      const recipient_id = recipientCheck[0].user_id

      // ✅ Normalize boolean fields
      const normalized: Record<string, boolean> = {}
      for (const [key, value] of Object.entries(fields)) {
        if (key === "details_shared") continue
        normalized[key] = value === true || value === "true"
      }

      const columns = Object.keys(normalized)
      const values = Object.values(normalized)

      if (columns.length === 0) continue

      // ✅ Add recipient_id to insert/update
      columns.unshift("recipient_id")
      values.unshift(recipient_id)
      columns.unshift("user_email")
      values.unshift(user.email)

      const columnList = columns.join(", ")
      const placeholders = columns.map((_, i) => `$${i + 3}`).join(", ")
      const updateList = columns.map((col, i) => `${col} = $${i + 3}`).join(", ")

      const queryString = `
        INSERT INTO user_share_details (user_id, recipient_email, ${columnList})
        VALUES ($1, $2, ${placeholders})
        ON CONFLICT (user_id, recipient_email)
        DO UPDATE SET ${updateList}
      `

      const params = [user.sub, recipient_email, ...values]
      await query(queryString, params)
    }

    return NextResponse.json({ success: true, message: "Preferences updated" })
  } catch (err: any) {
    console.error("❌ Server Error in POST /save-preferences:", err)
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 })
  }
})

// ===========================
// DELETE: Remove Shared Entry
// ===========================
export const DELETE = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    const body = await req.json()
    const recipient_email = body.recipientEmail?.trim()

    if (!recipient_email) {
      return NextResponse.json({ success: false, message: "Missing recipient email" }, { status: 400 })
    }

    await query(`DELETE FROM user_share_details WHERE user_id = $1 AND recipient_email = $2`, [
      user.sub,
      recipient_email,
    ])

    return NextResponse.json({ success: true, message: "Sharing entry deleted" })
  } catch (err: any) {
    console.error("❌ Error in DELETE /save-preferences:", err)
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 })
  }
})
