import crypto from "crypto"
import bcrypt from "bcryptjs"

// Token configuration constants
const TOKEN_LENGTH = 32 // 32 bytes = 256 bits
const TOKEN_EXPIRY_MINUTES = 30 // 30 minutes expiration
const HASH_ROUNDS = 12 // bcrypt rounds for token hashing

/**
 * Generate a cryptographically secure random token
 * @returns {string} Raw token string (not hashed)
 */
export function generateResetToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("hex")
}

/**
 * Hash a token for secure database storage
 * @param token - Raw token string
 * @returns {Promise<string>} Hashed token
 */
export async function hashToken(token: string): Promise<string> {
  return await bcrypt.hash(token, HASH_ROUNDS)
}

/**
 * Verify a raw token against its hashed version
 * @param token - Raw token from user
 * @param hashedToken - Hashed token from database
 * @returns {Promise<boolean>} True if tokens match
 */
export async function verifyToken(token: string, hashedToken: string): Promise<boolean> {
  return await bcrypt.compare(token, hashedToken)
}

/**
 * Generate expiration timestamp for reset tokens
 * @param minutes - Minutes from now (default: TOKEN_EXPIRY_MINUTES)
 * @returns {Date} Expiration date
 */
export function generateTokenExpiry(minutes: number = TOKEN_EXPIRY_MINUTES): Date {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + minutes)
  return expiry
}

/**
 * Check if a token has expired
 * @param expiresAt - Token expiration timestamp
 * @returns {boolean} True if token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt)
}

/**
 * Validate token format (hex string of correct length)
 * @param token - Token to validate
 * @returns {boolean} True if token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  const hexRegex = /^[a-f0-9]+$/i
  return token.length === TOKEN_LENGTH * 2 && hexRegex.test(token)
}

/**
 * Generate a complete token object for database storage
 * @param userId - User ID for the token
 * @param ipAddress - Optional IP address for security logging
 * @returns {Promise<TokenData>} Complete token data object
 */
export async function createTokenData(
  userId: number,
  ipAddress?: string,
): Promise<{
  userId: number
  token: string
  hashedToken: string
  expiresAt: Date
  ipAddress?: string
}> {
  const rawToken = generateResetToken()
  const hashedToken = await hashToken(rawToken)
  const expiresAt = generateTokenExpiry()

  return {
    userId,
    token: rawToken, // Return raw token for email
    hashedToken, // Store hashed version in DB
    expiresAt,
    ipAddress,
  }
}

/**
 * Clean up expired tokens (for background job)
 * @returns {string} SQL query to delete expired tokens
 */
export function getExpiredTokenCleanupQuery(): string {
  return `
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() 
    OR (used = true AND used_at < NOW() - INTERVAL '24 hours')
  `
}

/**
 * Rate limiting helper - check if user can request new token
 * @param lastRequestTime - Last token request timestamp
 * @param cooldownMinutes - Cooldown period in minutes (default: 5)
 * @returns {boolean} True if user can request new token
 */
export function canRequestNewToken(lastRequestTime: Date | null, cooldownMinutes = 5): boolean {
  if (!lastRequestTime) return true

  const cooldownMs = cooldownMinutes * 60 * 1000
  const timeSinceLastRequest = Date.now() - new Date(lastRequestTime).getTime()

  return timeSinceLastRequest >= cooldownMs
}

/**
 * Security helper - generate secure token with additional entropy
 * @returns {string} Extra secure token for sensitive operations
 */
export function generateSecureToken(): string {
  const timestamp = Date.now().toString()
  const randomBytes = crypto.randomBytes(TOKEN_LENGTH).toString("hex")
  const combined = timestamp + randomBytes

  return crypto.createHash("sha256").update(combined).digest("hex")
}
