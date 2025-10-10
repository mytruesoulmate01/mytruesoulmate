"use server"

import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/password-security"
import { sanitizeEmail } from "@/lib/validation"
import { sendVerificationEmail } from "@/lib/email-service"
import { randomBytes } from "crypto"

export type SignupResult = {
  success?: boolean
  message?: string
  email?: string
  error?: string
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  console.log("🔵 [SIGNUP::SERVER_ACTION] Server action started")
  const startTime = Date.now()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  console.log("🔵 [SIGNUP::FORM_DATA] Form data extracted", {
    email,
    hasPassword: !!password,
    hasConfirmPassword: !!confirmPassword,
  })

  // Validation
  if (!email || !password || !confirmPassword) {
    console.log("🔴 [SIGNUP::VALIDATION_FAILED] Missing required fields")
    return { error: "Email and password are required" }
  }

  if (password !== confirmPassword) {
    console.log("🔴 [SIGNUP::VALIDATION_FAILED] Password mismatch")
    return { error: "Passwords do not match" }
  }

  let sanitizedEmail: string

  try {
    const hashStartTime = Date.now()
    const hashedPassword = await hashPassword(password)
    const hashDuration = Date.now() - hashStartTime
    console.log("🟢 [SIGNUP::PASSWORD_HASH] Password hashed", { hashDuration: `${hashDuration}ms` })

    sanitizedEmail = sanitizeEmail(email)
    console.log("🟢 [SIGNUP::EMAIL_SANITIZE] Email sanitized", {
      original: email,
      sanitized: sanitizedEmail,
    })

    const verificationToken = randomBytes(32).toString("hex")
    console.log("🟢 [SIGNUP::TOKEN_GENERATED] Verification token generated")

    const dbStartTime = Date.now()
    const result = await sql`
      INSERT INTO user_registration (
        email_id, 
        password, 
        email_verified, 
        email_verification_token, 
        email_verification_sent_at
      )
      VALUES (
        ${sanitizedEmail}, 
        ${hashedPassword}, 
        false, 
        ${verificationToken}, 
        NOW()
      )
    `
    const dbDuration = Date.now() - dbStartTime

    console.log("🟢 [SIGNUP::DB_INSERT] User inserted", {
      rowsAffected: result.rowCount,
      dbDuration: `${dbDuration}ms`,
    })

    console.log("🟢 [SIGNUP::SENDING_EMAIL] Sending verification email")
    const emailResult = await sendVerificationEmail(sanitizedEmail, verificationToken, "signup")

    if (!emailResult.success) {
      console.error("🔴 [SIGNUP::EMAIL_FAILED] Failed to send verification email", {
        error: emailResult.error,
      })
      // Don't fail registration if email fails, user can resend later
    } else {
      console.log("🟢 [SIGNUP::EMAIL_SENT] Verification email sent successfully", {
        messageId: emailResult.messageId,
      })
    }

    const totalDuration = Date.now() - startTime
    console.log("🟢 [SIGNUP::COMPLETE] Registration complete", {
      totalDuration: `${totalDuration}ms`,
    })

    return {
      success: true,
      message: `Registration successful! Please check your email (${sanitizedEmail}) to verify your account.`,
      email: sanitizedEmail,
    }
  } catch (error) {
    const totalDuration = Date.now() - startTime
    const isPostgresError = error && typeof error === "object" && "code" in error

    if (isPostgresError) {
      const pgError = error as any

      if (pgError.code === "23505" && pgError.constraint === "user_registration_pkey") {
        return { error: "This email is already registered. Please use a different email or try logging in." }
      }

      if (pgError.code === "23505") {
        return { error: "This information is already registered. Please check your details." }
      }

      if (pgError.code?.startsWith("23")) {
        return { error: "Invalid data provided. Please check your information and try again." }
      }

      console.error("🔴 [SIGNUP::DATABASE_ERROR] PostgreSQL error", {
        email: sanitizedEmail,
        code: pgError.code,
        message: pgError.message,
        detail: pgError.detail,
        totalDuration: `${totalDuration}ms`,
      })
    } else {
      console.error("🔴 [SIGNUP::ERROR] Registration failed", {
        error: error instanceof Error ? error.message : String(error),
        email: sanitizedEmail,
        totalDuration: `${totalDuration}ms`,
        stack: error instanceof Error ? error.stack : undefined,
      })
    }

    return { error: "Failed to create account. Please try again." }
  }
}
