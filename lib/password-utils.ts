import bcrypt from "bcryptjs"
import { logger } from "./logger"

/**
 * Hash a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  logger.startTimer("password-utils", "hash-password")

  try {
    logger.debug(
      "password-utils",
      "Starting password hashing",
      {
        passwordLength: password.length,
        timestamp: new Date().toISOString(),
      },
      "hash-start",
    )

    // Generate a salt with a cost factor of 12
    // Higher values are more secure but slower
    const salt = await bcrypt.genSalt(12)

    // Hash the password with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt)

    const duration = logger.endTimer("password-utils", "hash-password")

    logger.debug(
      "password-utils",
      "Password hashing completed",
      {
        hashedPasswordLength: hashedPassword.length,
        duration,
        timestamp: new Date().toISOString(),
      },
      "hash-complete",
    )

    return hashedPassword
  } catch (error) {
    logger.endTimer("password-utils", "hash-password")

    logger.error(
      "password-utils",
      "Error hashing password",
      error as Error,
      {
        passwordLength: password.length,
        timestamp: new Date().toISOString(),
      },
      "hash-error",
    )

    throw error
  }
}

/**
 * Verify a password against a hash
 * @param password The plain text password to verify
 * @param hashedPassword The hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  logger.startTimer("password-utils", "verify-password")

  try {
    logger.debug(
      "password-utils",
      "Starting password verification",
      {
        passwordLength: password.length,
        hashedPasswordLength: hashedPassword.length,
        timestamp: new Date().toISOString(),
      },
      "verify-start",
    )

    const isValid = await bcrypt.compare(password, hashedPassword)

    const duration = logger.endTimer("password-utils", "verify-password")

    logger.debug(
      "password-utils",
      "Password verification completed",
      {
        isValid,
        duration,
        timestamp: new Date().toISOString(),
      },
      "verify-complete",
    )

    return isValid
  } catch (error) {
    logger.endTimer("password-utils", "verify-password")

    logger.error(
      "password-utils",
      "Error verifying password",
      error as Error,
      {
        passwordLength: password.length,
        hashedPasswordLength: hashedPassword.length,
        timestamp: new Date().toISOString(),
      },
      "verify-error",
    )

    throw error
  }
}

/**
 * Verify a token against a hash (for password reset tokens)
 * @param token The plain text token to verify
 * @param hashedToken The hashed token to compare against
 * @returns True if the token matches the hash, false otherwise
 */
export async function verifyToken(token: string, hashedToken: string): Promise<boolean> {
  logger.startTimer("password-utils", "verify-token")

  try {
    logger.debug(
      "password-utils",
      "Starting token verification",
      {
        tokenLength: token.length,
        hashedTokenLength: hashedToken.length,
        timestamp: new Date().toISOString(),
      },
      "token-verify-start",
    )

    const isValid = await bcrypt.compare(token, hashedToken)

    const duration = logger.endTimer("password-utils", "verify-token")

    logger.debug(
      "password-utils",
      "Token verification completed",
      {
        isValid,
        duration,
        timestamp: new Date().toISOString(),
      },
      "token-verify-complete",
    )

    return isValid
  } catch (error) {
    logger.endTimer("password-utils", "verify-token")

    logger.error(
      "password-utils",
      "Error verifying token",
      error as Error,
      {
        tokenLength: token.length,
        hashedTokenLength: hashedToken.length,
        timestamp: new Date().toISOString(),
      },
      "token-verify-error",
    )

    throw error
  }
}

/**
 * Generate a secure random token
 * @param length The length of the token to generate (default: 32)
 * @returns A secure random hex token
 */
export async function generateSecureToken(length = 32): Promise<string> {
  logger.startTimer("password-utils", "generate-token")

  try {
    logger.debug(
      "password-utils",
      "Starting secure token generation",
      {
        length,
        timestamp: new Date().toISOString(),
      },
      "token-generate-start",
    )

    // Use crypto.randomBytes for secure token generation
    const crypto = await import("crypto")
    const token = crypto.randomBytes(length).toString("hex")

    const duration = logger.endTimer("password-utils", "generate-token")

    logger.debug(
      "password-utils",
      "Secure token generation completed",
      {
        tokenLength: token.length,
        duration,
        timestamp: new Date().toISOString(),
      },
      "token-generate-complete",
    )

    return token
  } catch (error) {
    logger.endTimer("password-utils", "generate-token")

    logger.error(
      "password-utils",
      "Error generating secure token",
      error as Error,
      {
        length,
        timestamp: new Date().toISOString(),
      },
      "token-generate-error",
    )

    throw error
  }
}

/**
 * Hash a token using bcrypt (for password reset tokens)
 * @param token The plain text token to hash
 * @returns The hashed token
 */
export async function hashToken(token: string): Promise<string> {
  logger.startTimer("password-utils", "hash-token")

  try {
    logger.debug(
      "password-utils",
      "Starting token hashing",
      {
        tokenLength: token.length,
        timestamp: new Date().toISOString(),
      },
      "token-hash-start",
    )

    // Generate a salt with a cost factor of 12
    const salt = await bcrypt.genSalt(12)

    // Hash the token with the generated salt
    const hashedToken = await bcrypt.hash(token, salt)

    const duration = logger.endTimer("password-utils", "hash-token")

    logger.debug(
      "password-utils",
      "Token hashing completed",
      {
        hashedTokenLength: hashedToken.length,
        duration,
        timestamp: new Date().toISOString(),
      },
      "token-hash-complete",
    )

    return hashedToken
  } catch (error) {
    logger.endTimer("password-utils", "hash-token")

    logger.error(
      "password-utils",
      "Error hashing token",
      error as Error,
      {
        tokenLength: token.length,
        timestamp: new Date().toISOString(),
      },
      "token-hash-error",
    )

    throw error
  }
}
