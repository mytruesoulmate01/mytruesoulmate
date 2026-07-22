/**
 * Auth Error Sanitization
 * 
 * Security: Never expose raw Supabase error messages to the browser.
 * Maps errors to safe, fixed codes for URL params and action responses.
 * 
 * Priority: error.code (stable) → error.message pattern (fallback) → 'unknown'
 */

// Known Supabase error codes (preferred - more stable than messages)
const ERROR_CODE_MAPPINGS: Record<string, string> = {
  'pkce_error': 'session_expired',
  'flow_state_not_found': 'session_expired',
  'flow_state_expired': 'session_expired',
  'email_not_confirmed': 'email_not_confirmed',
  'otp_expired': 'link_expired',
  'otp_disabled': 'link_expired',
  'invalid_credentials': 'invalid_credentials',
  'user_not_found': 'invalid_credentials',
  'over_request_rate_limit': 'rate_limited',
  'over_email_send_rate_limit': 'rate_limited',
}

// Fallback: message pattern matching (only for known patterns)
const MESSAGE_PATTERN_MAPPINGS: Array<{ pattern: string; code: string }> = [
  { pattern: 'PKCE code verifier not found', code: 'session_expired' },
  { pattern: 'code verifier not found in storage', code: 'session_expired' },
  { pattern: 'Auth session missing', code: 'session_expired' },
  { pattern: 'Email not confirmed', code: 'email_not_confirmed' },
  { pattern: 'Invalid login credentials', code: 'invalid_credentials' },
  { pattern: 'Token has expired', code: 'link_expired' },
  { pattern: 'Email link is invalid or has expired', code: 'link_expired' },
  { pattern: 'User already registered', code: 'already_registered' },
  { pattern: 'already registered', code: 'already_registered' },
  { pattern: 'not confirmed yet', code: 'email_not_confirmed' },
  { pattern: 'For security purposes', code: 'rate_limited' },
]

// User-friendly messages (displayed to user)
const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  'session_expired': 'Your session expired or was started in a different browser. Please try again.',
  'email_not_confirmed': 'Please verify your email before logging in. Check your inbox for the confirmation link.',
  'invalid_credentials': 'Invalid email or password.',
  'link_expired': 'This link has expired. Please request a new one.',
  'already_registered': 'This email is already registered. Please login instead.',
  'rate_limited': 'Too many attempts. Please try again later.',
  'verification_failed': 'Verification failed. Please try again or request a new link.',
  'auth_callback_error': 'Authentication failed. Please try again.',
  'password_update_failed': 'Failed to update password. Please try again.',
  'unknown': 'An error occurred. Please try again.',
}

// Valid error codes (for validation)
const VALID_ERROR_CODES = new Set(Object.keys(USER_FRIENDLY_MESSAGES))

// Error codes that indicate session issues (not success)
const SESSION_ERROR_CODES = new Set([
  'session_expired',
  'link_expired',
  'verification_failed',
  'auth_callback_error',
  'unknown'
])

interface AuthError {
  code?: string
  message?: string
  name?: string
}

/**
 * Convert Supabase error to safe error code (for URLs)
 * Priority: error.code → error.message pattern → 'unknown'
 */
export function sanitizeErrorForUrl(error: AuthError | string | null | undefined): string {
  if (!error) return 'unknown'
  
  // Handle string input
  if (typeof error === 'string') {
    return sanitizeMessageToCode(error)
  }

  // Priority 1: Use error.code if available and mapped
  if (error.code && ERROR_CODE_MAPPINGS[error.code]) {
    return ERROR_CODE_MAPPINGS[error.code]
  }

  // Priority 2: Fall back to message pattern matching
  if (error.message) {
    return sanitizeMessageToCode(error.message)
  }

  return 'unknown'
}

/**
 * Pattern match error message to safe code
 */
function sanitizeMessageToCode(message: string): string {
  for (const { pattern, code } of MESSAGE_PATTERN_MAPPINGS) {
    if (message.includes(pattern)) {
      return code
    }
  }
  return 'unknown'
}

/**
 * Get user-friendly message from error code
 * Validates code against allowlist - unknown codes get generic message
 */
export function getErrorMessage(errorCode: string | null | undefined): string | null {
  if (!errorCode) return null
  
  // Validate against allowlist
  if (!VALID_ERROR_CODES.has(errorCode)) {
    return USER_FRIENDLY_MESSAGES['unknown']
  }
  
  return USER_FRIENDLY_MESSAGES[errorCode]
}

/**
 * Check if error code indicates a session/flow error (not a success state)
 */
export function isSessionError(errorCode: string | null | undefined): boolean {
  if (!errorCode) return false
  return SESSION_ERROR_CODES.has(errorCode)
}

/**
 * Sanitize error for server action response
 * Returns user-friendly message, never raw Supabase error
 */
export function sanitizeErrorForAction(error: AuthError | string | null | undefined): string {
  const code = sanitizeErrorForUrl(error)
  return USER_FRIENDLY_MESSAGES[code] || USER_FRIENDLY_MESSAGES['unknown']
}
