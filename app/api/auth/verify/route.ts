import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("[AUTH] No authenticated user found")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    console.log("[AUTH] Authentication successful", {
      userId: user.id,
      email: user.email,
    })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || "user",
        emailConfirmed: !!user.email_confirmed_at,
        fullName: user.user_metadata?.full_name || null,
      },
    })
  } catch (error) {
    console.error("[AUTH] Verification error:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
