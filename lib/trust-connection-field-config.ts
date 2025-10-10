// Configuration for trust-connections page field ordering

// Predefined field order for trust-connections page
export const TRUST_CONNECTION_FIELD_ORDER = [
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
 * Get fields in predefined order from available fields
 * @param availableFields - Set or array of available field names
 * @returns Array of field names in predefined order
 */
export function getOrderedConnectionFields(availableFields: Set<string> | string[]): string[] {
  const fieldSet = availableFields instanceof Set ? availableFields : new Set(availableFields)

  // Get predefined fields that exist in available fields
  const orderedFields = TRUST_CONNECTION_FIELD_ORDER.filter((field) => fieldSet.has(field))

  // Add any remaining fields not in predefined order (sorted alphabetically)
  const remainingFields = Array.from(fieldSet)
    .filter((field) => !TRUST_CONNECTION_FIELD_ORDER.includes(field))
    .sort((a, b) => a.localeCompare(b))

  return [...orderedFields, ...remainingFields]
}

/**
 * Format field name for display
 * @param fieldName - Raw field name from database
 * @returns Formatted field name for display
 */
export function formatConnectionFieldName(fieldName: string): string {
  return fieldName.replace(/_/g, " ").toUpperCase()
}
