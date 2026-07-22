import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sanitizeErrorForAction } from "@/lib/auth-errors"

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

    // Check rate limit and if user is unconfirmed
    const { data: result, error: rpcError } = await supabase
      .rpc('check_resend_rate_limit', { p_email: trimmedEmail })

    if (rpcError) {
      console.error("[Auth] Rate limit check error:", rpcError.message)
      return NextResponse.json(
        { message: "An error occurred. Please try again." },
        { status: 500 }
      )
    }

    if (!result.allowed) {
      return NextResponse.json(
        { message: result.reason },
        { status: result.reason.includes('Rate limit') ? 429 : 400 }
      )
    }

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      console.error("[Auth] Resend verification error:", error.message)
      // Sanitize error - never expose raw message
      return NextResponse.json(
        { message: sanitizeErrorForAction(error) },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Verification email sent! You have ${result.remaining} attempt(s) remaining.`,
    })

  } catch (error) {
    console.error("[Auth] Resend verification error:", error)
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
