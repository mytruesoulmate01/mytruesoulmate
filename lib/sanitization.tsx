/**
 * Input sanitization utilities for Trust Share feature security
 * Protects against XSS and SQL injection attacks in recipient email inputs
 */

export function sanitizeRecipientEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email input")
  }

  // Remove HTML tags and script content
  let cleaned = email
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers like onclick=
    .replace(/[<>'"]/g, "") // Remove dangerous characters
    .trim()

  // Remove SQL injection patterns
  cleaned = cleaned
    .replace(/['";]/g, "") // Remove SQL special characters
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove SQL block comments start
    .replace(/\*\//g, "") // Remove SQL block comments end
    .replace(/\bUNION\b/gi, "") // Remove UNION keyword
    .replace(/\bSELECT\b/gi, "") // Remove SELECT keyword
    .replace(/\bINSERT\b/gi, "") // Remove INSERT keyword
    .replace(/\bDELETE\b/gi, "") // Remove DELETE keyword
    .replace(/\bDROP\b/gi, "") // Remove DROP keyword

  // Validate email format after cleaning
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(cleaned)) {
    throw new Error("Invalid email format after sanitization")
  }

  return cleaned
}

export function sanitizeTrustShareData(shareData: any): any {
  if (!shareData || typeof shareData !== "object") {
    throw new Error("Invalid share data")
  }

  const sanitized = { ...shareData }

  // Sanitize recipient email if present
  if (sanitized.recipientEmail) {
    try {
      sanitized.recipientEmail = sanitizeRecipientEmail(sanitized.recipientEmail)
    } catch (error) {
      throw new Error(`Invalid recipient email: ${error.message}`)
    }
  }

  // Sanitize array of recipient emails if present
  if (Array.isArray(sanitized.recipients)) {
    sanitized.recipients = sanitized.recipients.map((email: string, index: number) => {
      try {
        return sanitizeRecipientEmail(email)
      } catch (error) {
        throw new Error(`Invalid recipient email at position ${index + 1}: ${error.message}`)
      }
    })
  }

  return sanitized
}

export function sanitizeForDatabase(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  // Additional database-specific sanitization
  return input
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/'/g, "''") // Escape single quotes for SQL
    .replace(/\0/g, "") // Remove null bytes
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t") // Escape tabs
}

export function sanitizeForDisplay(email: string): string {
  if (!email || typeof email !== "string") {
    return ""
  }

  // HTML escape for safe display in React components
  return email
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// Utility function to validate sanitized email
export function isValidSanitizedEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}
