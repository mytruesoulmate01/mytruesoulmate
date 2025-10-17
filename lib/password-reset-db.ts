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
  console.log("[v0] Creating password reset token", {
    userId,
    hashedTokenPreview: hashedToken.substring(0, 20) + "...",
    expiresAt: expiresAt.toISOString(),
    timestamp: new Date().toISOString(),
  })

  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${hashedToken}, ${expiresAt})
  `

  console.log("[v0] Password reset token created successfully", {
    userId,
    expiresAt: expiresAt.toISOString(),
  })
}

export async function findValidToken(userId: string, hashedToken: string): Promise<boolean> {
  console.log("[v0] Finding valid token", {
    userId,
    hashedTokenPreview: hashedToken.substring(0, 20) + "...",
  })

  const result = await sql`
    SELECT * FROM password_reset_tokens
    WHERE user_id = ${userId}
      AND token = ${hashedToken}
      AND used = false
      AND expires_at > NOW()
  `

  console.log("[v0] Token search result", {
    userId,
    found: result.length > 0,
    resultCount: result.length,
  })

  return result.length > 0
}

export async function markTokenAsUsed(userId: string, hashedToken: string): Promise<boolean> {
  console.log("[v0] Marking token as used", {
    userId,
    hashedTokenPreview: hashedToken.substring(0, 20) + "...",
    timestamp: new Date().toISOString(),
  })

  const result = await sql`
    UPDATE password_reset_tokens
    SET used = true, used_at = NOW()
    WHERE user_id = ${userId}
      AND token = ${hashedToken}
      AND used = false
      AND expires_at > NOW()
  `

  console.log("[v0] Token marked as used", {
    userId,
    success: result.count > 0,
    rowsAffected: result.count,
  })

  return result.count > 0
}

export async function validateUserForPasswordReset(
  email: string,
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  console.log("[v0] Validating user for password reset", {
    email,
    timestamp: new Date().toISOString(),
  })

  const result = await sql`
    SELECT user_id FROM user_registration WHERE email_id = ${email}
  `

  console.log("[v0] User validation result", {
    email,
    found: result.length > 0,
    userId: result.length > 0 ? result[0].user_id : null,
  })

  if (result.length === 0) return { valid: false, error: "User not found" }
  return { valid: true, userId: result[0].user_id }
}

export async function checkPasswordResetRateLimit(
  userId: string,
  cooldownMinutes = 5,
): Promise<{ canRequest: boolean; lastRequestTime?: Date; error?: string }> {
  console.log("[v0] Checking password reset rate limit", {
    userId,
    cooldownMinutes,
    timestamp: new Date().toISOString(),
  })

  const result = await sql`
    SELECT created_at FROM password_reset_tokens
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (result.length === 0) {
    console.log("[v0] No previous reset requests found", { userId })
    return { canRequest: true }
  }

  const lastRequestTime = new Date(result[0].created_at)
  const timeDiff = Date.now() - lastRequestTime.getTime()
  const cooldownMs = cooldownMinutes * 60 * 1000
  const canRequest = timeDiff >= cooldownMs

  console.log("[v0] Rate limit check result", {
    userId,
    lastRequestTime: lastRequestTime.toISOString(),
    timeDiffSeconds: Math.floor(timeDiff / 1000),
    cooldownSeconds: cooldownMinutes * 60,
    canRequest,
  })

  return { canRequest, lastRequestTime }
}

export async function storePasswordResetToken(
  userId: string,
  hashedToken: string,
  expiresAt: Date,
  ipAddress?: string,
): Promise<{ success: boolean; error?: string; tokenId?: number }> {
  console.log("[v0] Storing password reset token", {
    userId,
    hashedTokenPreview: hashedToken.substring(0, 20) + "...",
    hashedTokenLength: hashedToken.length,
    expiresAt: expiresAt.toISOString(),
    ipAddress,
    timestamp: new Date().toISOString(),
  })

  // Mark old tokens as used
  console.log("[v0] Marking old tokens as used", { userId })
  await sql`
    UPDATE password_reset_tokens
    SET used = true, used_at = NOW()
    WHERE user_id = ${userId} AND used = false AND expires_at > NOW()
  `

  // Insert new token
  console.log("[v0] Inserting new token into database", { userId })
  const result = await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at, ip_address, created_at)
    VALUES (${userId}, ${hashedToken}, ${expiresAt}, ${ipAddress}, NOW())
    RETURNING id
  `

  if (result.length === 0) {
    console.log("[v0] Failed to store reset token", { userId })
    return { success: false, error: "Failed to store reset token" }
  }

  console.log("[v0] Token stored successfully", {
    userId,
    tokenId: result[0].id,
    expiresAt: expiresAt.toISOString(),
  })

  return { success: true, tokenId: result[0].id }
}

export async function getPasswordResetToken(
  rawToken: string,
): Promise<{ valid: boolean; userId?: string; token?: string; expiresAt?: Date; used?: boolean; error?: string }> {
  console.log("[v0] Getting password reset token", {
    rawTokenPreview: rawToken.substring(0, 20) + "...",
    rawTokenLength: rawToken.length,
    timestamp: new Date().toISOString(),
  })

  const result = await sql`
    SELECT user_id, token, expires_at, used, created_at, id
    FROM password_reset_tokens
    WHERE used = false AND expires_at > NOW()
    ORDER BY created_at DESC
  `

  console.log("[v0] Database query result", {
    totalTokensFound: result.length,
    rawTokenPreview: rawToken.substring(0, 20) + "...",
  })

  for (let i = 0; i < result.length; i++) {
    const tokenData = result[i]
    console.log(`[v0] Comparing token ${i + 1}/${result.length}`, {
      tokenId: tokenData.id,
      userId: tokenData.user_id,
      dbTokenPreview: tokenData.token.substring(0, 20) + "...",
      rawTokenPreview: rawToken.substring(0, 20) + "...",
    })

    if (await verifyToken(rawToken, tokenData.token)) {
      console.log("[v0] Token match found!", {
        tokenId: tokenData.id,
        userId: tokenData.user_id,
        matchIndex: i + 1,
      })

      return {
        valid: true,
        userId: tokenData.user_id,
        token: tokenData.token,
        expiresAt: new Date(tokenData.expires_at),
        used: tokenData.used,
      }
    } else {
      console.log(`[v0] Token ${i + 1} did not match`, {
        tokenId: tokenData.id,
      })
    }
  }

  console.log("[v0] No matching token found", {
    tokensChecked: result.length,
    rawTokenPreview: rawToken.substring(0, 20) + "...",
  })

  return { valid: false, error: "Token not found" }
}

export async function updateUserPassword(
  userId: string,
  hashedPassword: string,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Updating user password", {
    userId,
    hashedPasswordPreview: hashedPassword.substring(0, 20) + "...",
    timestamp: new Date().toISOString(),
  })

  const result = await sql`
    UPDATE user_registration
    SET password = ${hashedPassword}
    WHERE user_id = ${userId}
  `

  console.log("[v0] Password update result", {
    userId,
    success: result.count > 0,
    rowsAffected: result.count,
  })

  return { success: result.count > 0, error: result.count > 0 ? undefined : "User not found" }
}

export async function getUserEmailForReset(userId: string): Promise<{ email?: string; error?: string }> {
  console.log("[v0] Getting user email for reset", {
    userId,
    timestamp: new Date().toISOString(),
  })

  const result = await sql`
    SELECT email_id FROM user_registration WHERE user_id = ${userId}
  `

  console.log("[v0] Email retrieval result", {
    userId,
    found: result.length > 0,
  })

  if (result.length === 0) return { error: "User not found" }
  return { email: result[0].email_id }
}
