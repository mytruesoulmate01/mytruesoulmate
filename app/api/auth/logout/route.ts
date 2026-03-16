import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    console.log("[LOGOUT] Logout process initiated")
    
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("[LOGOUT] Error during sign out:", error)
      return NextResponse.json({ error: "Sign out failed" }, { status: 500 })
    }

    console.log("[LOGOUT] User logged out successfully")

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("[LOGOUT] Error during logout process:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
