// Field ordering configuration for trustscore and profile pages
export const FIELD_ORDER = [
  "name",
  "address",
  "mobile_number",
  "age",
  "dob",
  "gender",
  "email_id",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "education",
  "employment",
  "income",
  "engagement",
  "marriage",
  "father_name",
  "mother_name",
  "brother_name",
  "sister_name",
  "court_case",
  "police_record",
  "expectation_details",
]

// Helper function to get ordered fields from user data
export function getOrderedFields(userData: Record<string, any>): Array<[string, any]> {
  const orderedFields: Array<[string, any]> = []

  // Add fields in predefined order if they exist in userData
  FIELD_ORDER.forEach((fieldName) => {
    if (userData.hasOwnProperty(fieldName)) {
      orderedFields.push([fieldName, userData[fieldName]])
    }
  })

  // Add any remaining fields not in the predefined order
  Object.entries(userData).forEach(([key, value]) => {
    if (!FIELD_ORDER.includes(key) && key !== "user_id" && key !== "truscore") {
      orderedFields.push([key, value])
    }
  })

  return orderedFields
}

// Helper function to format field names for display
export function formatFieldName(fieldName: string): string {
  return fieldName.replace(/_/g, " ").toUpperCase()
}
