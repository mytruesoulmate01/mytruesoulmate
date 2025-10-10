import { sql } from "@/lib/db"
import { verifyToken } from "./password-utils"

export interface PasswordResetToken {
  id: number
  user_id: string
  token: string
  expires_at: string
  ip_address: string
  created_at: string
  used: boolean
  used_at: string | null
}

export async function createPasswordResetToken(userId: string, hashedToken: string, expiresAt: Date): Promise<void> {
  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${hashedToken}, ${expiresAt})
  `
}

export async function findValidToken(userId: string, hashedToken: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM password_reset_tokens
    WHERE user_id = ${userId}
      AND token = ${hashedToken}
      AND used = false
      AND expires_at > NOW()
  `
  return result.length > 0
}

export async function markTokenAsUsed(userId: string, hashedToken: string): Promise<boolean> {
  const result = await sql`
    UPDATE password_reset_tokens
    SET used = true, used_at = NOW()
    WHERE user_id = ${userId}
      AND token = ${hashedToken}
      AND used = false
      AND expires_at > NOW()
  `
  return result.count > 0
}

export async function validateUserForPasswordReset(
  email: string,
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const result = await sql`
    SELECT user_id FROM user_registration WHERE email_id = ${email}
  `
  if (result.length === 0) return { valid: false, error: "User not found" }
  return { valid: true, userId: result[0].user_id }
}

export async function checkPasswordResetRateLimit(
  userId: string,
  cooldownMinutes = 5,
): Promise<{ canRequest: boolean; lastRequestTime?: Date; error?: string }> {
  const result = await sql`
    SELECT created_at FROM password_reset_tokens
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (result.length === 0) return { canRequest: true }
  const lastRequestTime = new Date(result[0].created_at)
  const timeDiff = Date.now() - lastRequestTime.getTime()
  const cooldownMs = cooldownMinutes * 60 * 1000
  return { canRequest: timeDiff >= cooldownMs, lastRequestTime }
}

export async function storePasswordResetToken(
  userId: string,
  hashedToken: string,
  expiresAt: Date,
  ipAddress?: string,
): Promise<{ success: boolean; error?: string; tokenId?: number }> {
  await sql`
    UPDATE password_reset_tokens
    SET used = true, used_at = NOW()
    WHERE user_id = ${userId} AND used = false AND expires_at > NOW()
  `

  const result = await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at, ip_address, created_at)
    VALUES (${userId}, ${hashedToken}, ${expiresAt}, ${ipAddress}, NOW())
    RETURNING id
  `

  if (result.length === 0) return { success: false, error: "Failed to store reset token" }
  return { success: true, tokenId: result[0].id }
}

export async function getPasswordResetToken(
  rawToken: string,
): Promise<{ valid: boolean; userId?: string; token?: string; expiresAt?: Date; used?: boolean; error?: string }> {
  const result = await sql`
    SELECT user_id, token, expires_at, used, created_at, id
    FROM password_reset_tokens
    WHERE used = false AND expires_at > NOW()
    ORDER BY created_at DESC
  `
  for (const tokenData of result) {
    if (await verifyToken(rawToken, tokenData.token)) {
      return {
        valid: true,
        userId: tokenData.user_id,
        token: tokenData.token,
        expiresAt: new Date(tokenData.expires_at),
        used: tokenData.used,
      }
    }
  }
  return { valid: false, error: "Token not found" }
}

export async function updateUserPassword(
  userId: string,
  hashedPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await sql`
    UPDATE user_registration
    SET password = ${hashedPassword}
    WHERE user_id = ${userId}
  `
  return { success: result.count > 0, error: result.count > 0 ? undefined : "User not found" }
}

export async function getUserEmailForReset(userId: string): Promise<{ email?: string; error?: string }> {
  const result = await sql`
    SELECT email_id FROM user_registration WHERE user_id = ${userId}
  `
  if (result.length === 0) return { error: "User not found" }
  return { email: result[0].email_id }
}
