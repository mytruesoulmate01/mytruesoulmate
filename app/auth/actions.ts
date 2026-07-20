"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

/**
 * Get the base URL for redirects
 * Uses the official production URL
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://mytruesoulmate.com'
}

export type AuthResult = {
  success?: boolean
  message?: string
  error?: string
  email?: string
  errorType?: "confirmed" | "unconfirmed"
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const consultationCode = formData.get("consultationCode") as string
  const fullName = formData.get("fullName") as string | null

  // Validation
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  if (!consultationCode) {
    return { error: "Consultation code is required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Password strength validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  if (!Object.values(passwordValidation).every(Boolean)) {
    return { error: "Password must be at least 8 characters with uppercase, lowercase, and a number" }
  }

  const supabase = await createClient()

  // Validate consultation code before creating user
  const { data: codeResult, error: codeError } = await supabase
    .rpc('validate_and_use_access_code', {
      input_code: consultationCode.toUpperCase(),
      input_email: email.toLowerCase()
    })

  if (codeError) {
    console.error("[Auth] Consultation code validation error:", codeError.message)
    return { error: "Unable to validate consultation code. Please try again." }
  }

  if (!codeResult?.valid) {
    return { error: codeResult?.error || "Invalid or already used consultation code" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
      data: {
        full_name: fullName || null,
      },
    },
  })

  if (error) {
    console.error("[Auth] Sign up error:", error.message)
    
    // Hook error: Email already confirmed (fully registered)
    if (error.message.includes("already registered")) {
      return { 
        error: "This email is already registered. Please login instead.",
        errorType: "confirmed"
      }
    }
    
    // Hook error: Email exists but not confirmed yet
    if (error.message.includes("not confirmed yet")) {
      return { 
        error: "This account exists but email is not confirmed. Please check your inbox or request a new confirmation email.",
        errorType: "unconfirmed"
      }
    }
    
    return { error: error.message }
  }

  if (data?.user) {
    return {
      success: true,
      message: "Registration successful! Please check your email for a confirmation link.",
      email: data.user.email || email,
    }
  }

  return { error: "Failed to create account. Please try again." }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[Auth] Sign in error:", error.message)
    
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password" }
    }
    
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email before logging in. Check your inbox for the confirmation link." }
    }
    
    return { error: error.message }
  }

  if (data?.user) {
    revalidatePath("/", "layout")
    return { success: true }
  }

  return { error: "Login failed. Please try again." }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

/**
 * Request a password reset email
 */
export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const supabase = await createClient()

  const redirectUrl = `${getBaseUrl()}/reset-password`
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) {
    console.error("[Auth] Password reset error:", error.message)
    return { error: error.message }
  }

  return {
    success: true,
    message: "If an account exists with this email, you will receive a password reset link.",
  }
}

/**
 * Update the user's password (after clicking reset link)
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password) {
    return { error: "Password is required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Password strength validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  if (!Object.values(passwordValidation).every(Boolean)) {
    return { error: "Password must be at least 8 characters with uppercase, lowercase, and a number" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    console.error("[Auth] Password update error:", error.message)
    return { error: error.message }
  }

  return {
    success: true,
    message: "Password updated successfully! You can now log in with your new password.",
  }
}

/**
 * Get the current authenticated user
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}
