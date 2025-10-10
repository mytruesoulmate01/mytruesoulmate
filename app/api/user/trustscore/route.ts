import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { sql } from "@/lib/db";
import type { JWTPayload } from "@/lib/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const GET = withAuth(async (_req: NextRequest, user: JWTPayload) => {
  console.log(`[API][Trustscore] 🔍 Request received for user_id: ${user.sub}`);

  try {
    // Step 1: Check if user exists
    const result = await sql`
      SELECT * FROM user_details WHERE user_id = ${user.sub}
    `;

    let userData: Record<string, any>;

    if (result.length > 0) {
      // ✅ User exists — use destructuring to exclude user_id
      const { user_id, ...rest } = result[0];
      userData = rest;

      console.log(`[API][Trustscore] ✅ User data found`);
    } else {
      // ❌ User does not exist — build default object with all columns
      console.warn(`[API][Trustscore] ⚠️ No user found, returning default structure`);

      const columns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user_details'
      `;

      userData = {};
      for (const row of columns) {
        const column = row.column_name;
        if (column !== "user_id") {
          userData[column] = "Not Available";
        }
      }
    }

    // ✅ Log final payload
    console.log(`[API][Trustscore] 📦 Final user data:`, userData);

    return NextResponse.json(
      { success: true, user: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API][Trustscore] ❌ Error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
