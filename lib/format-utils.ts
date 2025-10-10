/**
 * Utility functions for formatting user data
 */

/**
 * Format date from YYYY-MM-DD to readable format
 */
export function formatDateOfBirth(dateString: string): string {
  if (!dateString || dateString === "Not provided") return "Not provided"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Not provided"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    return "Not provided"
  }
}

/**
 * Convert gender code to readable format
 */
export function formatGender(genderCode: string): string {
  if (!genderCode || genderCode === "Not specified") return "Not specified"

  switch (genderCode.toUpperCase()) {
    case "M":
      return "Male"
    case "F":
      return "Female"
    default:
      return "Not specified"
  }
}

/**
 * Format email for display
 */
export function formatEmail(email: string): string {
  if (!email) return "Not provided"
  return email.toLowerCase()
}
