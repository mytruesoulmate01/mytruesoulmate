import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    const supabase = await createClient()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      console.error("[Auth] Resend verification error:", error.message)
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Verification email sent! Please check your inbox.",
    })

  } catch (error) {
    console.error("[Auth] Resend verification error:", error)
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
