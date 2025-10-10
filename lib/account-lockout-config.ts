/**
 * Account Lockout Configuration
 * Defines constants and utilities for account lockout mechanism
 */

// Configuration Constants
export const ACCOUNT_LOCKOUT_CONFIG = {
  // Maximum failed login attempts before account lockout
  MAX_FAILED_ATTEMPTS: 5,

  // Lockout duration in minutes
  LOCKOUT_DURATION_MINUTES: 15,

  // Lockout duration in milliseconds (for calculations)
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes

  // Time window to reset failed attempts (in minutes)
  RESET_WINDOW_MINUTES: 60,
} as const

// TypeScript interfaces
export interface AccountLockoutStatus {
  isLocked: boolean
  failedAttempts: number
  lockedUntil: Date | null
  remainingLockoutTime?: number // in milliseconds
}

export interface UserWithLockout {
  user_id: string
  email_id: string
  failed_attempts: number
  locked_until: Date | null
  last_failed_attempt: Date | null
}

// Helper Functions
export function isAccountCurrentlyLocked(user: UserWithLockout): boolean {
  if (!user.locked_until) {
    return false
  }

  const now = new Date()
  const lockoutExpiry = new Date(user.locked_until)

  return now < lockoutExpiry
}

export function getRemainingLockoutTime(user: UserWithLockout): number {
  if (!user.locked_until) {
    return 0
  }

  const now = new Date()
  const lockoutExpiry = new Date(user.locked_until)

  if (now >= lockoutExpiry) {
    return 0
  }

  return lockoutExpiry.getTime() - now.getTime()
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= ACCOUNT_LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS
}

export function calculateLockoutExpiry(): Date {
  const now = new Date()
  return new Date(now.getTime() + ACCOUNT_LOCKOUT_CONFIG.LOCKOUT_DURATION_MS)
}

export function formatLockoutTimeRemaining(milliseconds: number): string {
  const minutes = Math.ceil(milliseconds / (1000 * 60))

  if (minutes <= 1) {
    return "less than 1 minute"
  }

  return `${minutes} minutes`
}

// Error messages
export const LOCKOUT_ERROR_MESSAGES = {
  ACCOUNT_LOCKED: "Account is temporarily locked due to multiple failed login attempts.",
  LOCKOUT_TIME_REMAINING: (timeRemaining: string) => `Account is locked. Please try again in ${timeRemaining}.`,
  MAX_ATTEMPTS_REACHED: "Maximum login attempts exceeded. Account has been locked for security.",
} as const
