import bcrypt from "bcryptjs"
import crypto from "crypto"

// Password validation configuration
const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?",
}

// Common weak passwords and patterns
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "password1",
  "qwerty123",
  "dragon",
  "master",
  "hello",
  "login",
  "passw0rd",
  "welcome123",
]

const SEQUENTIAL_PATTERNS = [
  "123456",
  "654321",
  "abcdef",
  "fedcba",
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "098765",
  "mnbvcx",
  "poiuyt",
]

export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-4 (0: very weak, 4: very strong)
  feedback: string[]
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumbers: boolean
    hasSpecialChars: boolean
  }
  estimatedCrackTime?: string
}

export interface PasswordStrengthResult {
  score: number // 0-4 (0: very weak, 4: very strong)
  isValid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumbers: boolean
    hasSpecialChars: boolean
  }
  feedback: string[]
  estimatedCrackTime: string
}

/**
 * Hash a password using bcrypt with simple console logging
 */
export async function hashPassword(password: string): Promise<string> {
  const startTime = Date.now()

  try {
    console.log("🔐 [password-security::hash-start] Starting password hashing", {
      passwordLength: password.length,
      timestamp: new Date().toISOString(),
    })

    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const duration = Date.now() - startTime
    console.log("🔐 [password-security::hash-complete] Password hashed successfully", {
      saltRounds,
      hashedLength: hashedPassword.length,
      processingTime: `${duration}ms`,
    })

    return hashedPassword
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("🔐 [password-security::hash-failure] Password hashing error", {
      error: error instanceof Error ? error.message : "Unknown error",
      passwordLength: password.length,
      processingTime: `${duration}ms`,
    })

    throw new Error("Password hashing failed")
  }
}

/**
 * Verify a password against its hash with simple console logging
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const startTime = Date.now()

  try {
    console.log("🔐 [password-security::verify-start] Starting password verification", {
      passwordLength: password.length,
      hashLength: hashedPassword.length,
      timestamp: new Date().toISOString(),
    })

    const isValid = await bcrypt.compare(password, hashedPassword)
    const duration = Date.now() - startTime

    if (isValid) {
      console.log("🔐 [password-security::verify-success] Password verification successful", {
        processingTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.warn("🔐 [password-security::verify-failure] Password verification failed", {
        processingTime: `${duration}ms`,
        reason: "Invalid password provided",
        timestamp: new Date().toISOString(),
      })
    }

    return isValid
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("🔐 [password-security::verify-exception] Password verification exception", {
      error: error instanceof Error ? error.message : "Unknown error",
      passwordLength: password.length,
      hashLength: hashedPassword.length,
      processingTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

    return false
  }
}

/**
 * Generate a cryptographically secure token with simple console logging
 */
export function generateSecureToken(length = 32): string {
  const startTime = Date.now()

  try {
    console.log("🔐 [password-security::token-start] Generating secure token", {
      requestedLength: length,
      timestamp: new Date().toISOString(),
    })

    const token = crypto.randomBytes(length).toString("hex")
    const duration = Date.now() - startTime

    console.log("🔐 [password-security::token-success] Secure token generation completed", {
      tokenLength: token.length,
      processingTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

    return token
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("🔐 [password-security::token-failure] Token generation error", {
      error: error instanceof Error ? error.message : "Unknown error",
      requestedLength: length,
      processingTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

    throw new Error("Token generation failed")
  }
}

/**
 * Validate password strength with comprehensive analysis
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const startTime = Date.now()

  console.log("🔐 [password-security::strength-start] Starting password strength validation", {
    passwordLength: password.length,
    timestamp: new Date().toISOString(),
  })

  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }

  const feedback: string[] = []
  let score = 0

  // Check basic requirements
  if (!requirements.minLength) feedback.push("Password must be at least 8 characters long")
  if (!requirements.hasUppercase) feedback.push("Password must contain at least one uppercase letter")
  if (!requirements.hasLowercase) feedback.push("Password must contain at least one lowercase letter")
  if (!requirements.hasNumbers) feedback.push("Password must contain at least one number")
  if (!requirements.hasSpecialChars) feedback.push("Password must contain at least one special character")

  // Calculate base score
  Object.values(requirements).forEach((met) => {
    if (met) score++
  })

  // Check for common passwords
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.includes(lowerPassword)) {
    feedback.push("This is a commonly used password. Please choose something more unique.")
    score = Math.max(0, score - 2)
  }

  // Check for sequential patterns
  const hasSequentialPattern = SEQUENTIAL_PATTERNS.some(
    (pattern) => lowerPassword.includes(pattern) || lowerPassword.includes(pattern.split("").reverse().join("")),
  )

  if (hasSequentialPattern) {
    feedback.push("Avoid using sequential characters or keyboard patterns.")
    score = Math.max(0, score - 1)
  }

  // Check for repeated characters
  const hasRepeatedChars = /(.)\1{2,}/.test(password)
  if (hasRepeatedChars) {
    feedback.push("Avoid using repeated characters.")
    score = Math.max(0, score - 1)
  }

  // Bonus points for longer passwords
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Cap the score at 4
  score = Math.min(4, score)

  // Estimate crack time based on entropy
  const charset =
    (requirements.hasLowercase ? 26 : 0) +
    (requirements.hasUppercase ? 26 : 0) +
    (requirements.hasNumbers ? 10 : 0) +
    (requirements.hasSpecialChars ? 32 : 0)

  const entropy = Math.log2(Math.pow(charset, password.length))
  const estimatedCrackTime =
    entropy < 30
      ? "Less than 1 day"
      : entropy < 40
        ? "Few days"
        : entropy < 50
          ? "Few months"
          : entropy < 60
            ? "Few years"
            : "Centuries"

  const isValid = Object.values(requirements).every(Boolean) && feedback.length === 0

  const duration = Date.now() - startTime

  if (isValid) {
    console.log("🔐 [password-security::strength-valid] Password strength validation passed", {
      score,
      estimatedCrackTime,
      processingTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } else {
    console.warn("🔐 [password-security::strength-weak] Password strength validation failed", {
      score,
      feedbackCount: feedback.length,
      processingTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  }

  return {
    score,
    isValid,
    requirements,
    feedback,
    estimatedCrackTime,
  }
}

/**
 * Generate a secure password with guaranteed character diversity
 */
export function generateSecurePassword(length = 16): string {
  const startTime = Date.now()

  console.log("🔐 [password-security::generate-start] Generating secure password", {
    requestedLength: length,
    timestamp: new Date().toISOString(),
  })

  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = lowercase + uppercase + numbers + symbols
  let password = ""

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")

  const duration = Date.now() - startTime
  console.log("🔐 [password-security::generate-complete] Secure password generated", {
    passwordLength: password.length,
    processingTime: `${duration}ms`,
    timestamp: new Date().toISOString(),
  })

  return password
}

/**
 * Check if password has been compromised in data breaches
 * This is a placeholder for future HaveIBeenPwned integration
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  const startTime = Date.now()

  console.log("🔐 [password-security::breach-check-start] Starting breach check", {
    passwordLength: password.length,
    timestamp: new Date().toISOString(),
  })

  // TODO: Implement HaveIBeenPwned API integration
  // For now, return false (not breached)

  const duration = Date.now() - startTime
  console.log("🔐 [password-security::breach-check-complete] Breach check completed", {
    isBreached: false,
    processingTime: `${duration}ms`,
    note: "HaveIBeenPwned integration pending",
    timestamp: new Date().toISOString(),
  })

  return false
}
