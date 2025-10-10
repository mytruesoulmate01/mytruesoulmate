// Configuration for TrustShare page field ordering
// This defines the specific order in which fields should be displayed

export const TRUST_SHARE_FIELD_ORDER = [
  "name",
  "address",
  "mobile_number",
  "age",
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

/**
 * Get fields in the predefined order, filtering out any that don't exist in the data
 * @param availableFields - Set of fields available from the API data
 * @returns Array of field names in the specified order
 */
export function getOrderedShareFields(availableFields: Set<string>): string[] {
  // First, get fields in our predefined order that exist in the data
  const orderedFields = TRUST_SHARE_FIELD_ORDER.filter((field) => availableFields.has(field))

  // Then add any remaining fields that weren't in our predefined list
  const remainingFields = Array.from(availableFields).filter((field) => !TRUST_SHARE_FIELD_ORDER.includes(field))

  return [...orderedFields, ...remainingFields]
}

/**
 * Format field name for display (convert underscores to spaces and capitalize)
 * @param fieldName - Raw field name from database
 * @returns Formatted field name for display
 */
export function formatShareFieldName(fieldName: string): string {
  return fieldName.replace(/_/g, " ").toUpperCase()
}
