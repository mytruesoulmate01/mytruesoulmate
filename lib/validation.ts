/**
 * Validate email format
 * @param email The email to validate
 * @returns An error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return "Email is required"
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address"
  }

  return null
}

/**
 * Validate password strength
 * @param password The password to validate
 * @returns An error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required"
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number"
  }

  return null
}

/**
 * Validate date of birth
 * @param dateOfBirth The date of birth to validate (YYYY-MM-DD format)
 * @returns An error message if invalid, null if valid
 */
export function validateDateOfBirth(dateOfBirth: string): string | null {
  if (!dateOfBirth) {
    return "Date of birth is required"
  }

  // Check if date is in valid format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateOfBirth)) {
    return "Date of birth must be in YYYY-MM-DD format"
  }

  const dob = new Date(dateOfBirth)
  const today = new Date()

  // Check if date is valid
  if (isNaN(dob.getTime())) {
    return "Please enter a valid date"
  }

  // Check if date is not in the future
  if (dob > today) {
    return "Date of birth cannot be in the future"
  }

  // Check if user is at least 18 years old
  const age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  const dayDiff = today.getDate() - dob.getDate()

  if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
    return "You must be at least 18 years old to register"
  }

  // Check if age is reasonable (not more than 120 years)
  if (age > 120) {
    return "Please enter a valid date of birth"
  }

  return null
}

/**
 * Validate gender
 * @param gender The gender to validate
 * @returns An error message if invalid, null if valid
 */
export function validateGender(gender: string): string | null {
  if (!gender) {
    return "Gender is required"
  }

  const validGenders = ["male", "female", "other", "prefer_not_to_say"]
  if (!validGenders.includes(gender.toLowerCase())) {
    return "Please select a valid gender option"
  }

  return null
}

/**
 * Validate OTP format
 * @param otp The OTP to validate
 * @returns An error message if invalid, null if valid
 */
export function validateOTP(otp: string): string | null {
  if (!otp) {
    return "Verification code is required"
  }

  // Check if OTP is exactly 6 digits
  const otpRegex = /^\d{6}$/
  if (!otpRegex.test(otp)) {
    return "Verification code must be exactly 6 digits"
  }

  return null
}

/**
 * Sanitize email address
 * @param email The email to sanitize
 * @returns The sanitized email
 */
export function sanitizeEmail(email: string): string {
  // Convert to lowercase
  return email.trim().toLowerCase()
}
