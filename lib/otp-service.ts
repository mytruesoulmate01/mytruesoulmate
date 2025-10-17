/**
 * Generates a random 6-digit OTP code
 * @returns A string containing 6 random digits (100000-999999)
 */
export function generateOTP(): string {
  // Generate random number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000)
  return otp.toString()
}

/**
 * Validates OTP format
 * @param otp - The OTP string to validate
 * @returns true if OTP is exactly 6 digits, false otherwise
 */
export function validateOTPFormat(otp: string): boolean {
  // Check if OTP is exactly 6 digits
  const otpRegex = /^\d{6}$/
  return otpRegex.test(otp)
}

/**
 * Checks if OTP has expired
 * @param expiresAt - The expiration timestamp from database
 * @returns true if OTP is expired, false if still valid
 */
export function isOTPExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return true
  }

  const now = new Date()
  return now > expiresAt
}

/**
 * Gets OTP expiration time (10 minutes from now)
 * @returns Date object representing 10 minutes in the future
 */
export function getOTPExpirationTime(): Date {
  const expirationTime = new Date()
  expirationTime.setMinutes(expirationTime.getMinutes() + 10)
  return expirationTime
}
