import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function POST() {
  try {
    console.log("[LOGOUT] Logout process initiated")
    
    const supabase = await createClient()
    
    // Use scope: 'global' to invalidate all sessions across all devices
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    
    if (error) {
      console.error("[LOGOUT] Error during sign out:", error)
      return NextResponse.json(
        { error: "Sign out failed" }, 
        { status: 500, headers: noStoreHeaders }
      )
    }

    console.log("[LOGOUT] User logged out successfully (all sessions)")

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { headers: noStoreHeaders }
    )
  } catch (error) {
    console.error("[LOGOUT] Error during logout process:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500, headers: noStoreHeaders }
    )
  }
}
