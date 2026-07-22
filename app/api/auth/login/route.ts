import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateEmail, sanitizeEmail } from "@/lib/validation"
import { sanitizeErrorForAction } from "@/lib/auth-errors"

export interface LoginRequest {
  email: string
  password: string
}


export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Application-level validation
    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json({ error: "INVALID_EMAIL", message: emailError }, { status: 400 })
    }

    if (!password || password.length < 1) {
      return NextResponse.json({ error: "INVALID_PASSWORD", message: "Password is required" }, { status: 400 })
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email)

    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    })

    if (error) {
      console.error("[Login] Supabase auth error:", error.message)
      
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "INVALID_CREDENTIALS", message: "Invalid email or password" },
          { status: 401 }
        )
      }
      
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json(
          {
            error: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email address before logging in. Check your inbox for the verification link.",
          },
          { status: 403 }
        )
      }

      // Sanitize unknown errors - never expose raw message
      return NextResponse.json(
        { error: "LOGIN_FAILED", message: sanitizeErrorForAction(error) },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "LOGIN_FAILED", message: "Login failed. Please try again." },
        { status: 401 }
      )
    }

    console.log("[Login] User authenticated successfully:", data.user.email)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "user",
        emailConfirmed: !!data.user.email_confirmed_at,
      },
    })
  } catch (error) {
    console.error("[Login] Error:", error)
    return NextResponse.json(
      {
        error: "LOGIN_FAILED",
        message: "Login failed. Please try again.",
      },
      { status: 500 }
    )
  }
}
