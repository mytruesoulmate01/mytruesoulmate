import { formatConnectionFieldName } from "./trust-connection-field-config"

// Section configuration for organizing connection fields
export const connectionSectionConfig = {
  "Personal Details": ["name", "address", "mobile_number", "age", "gender", "email_id"],
  "Social Media Details": ["facebook", "instagram", "twitter", "linkedin"],
  "Education Details": ["education"],
  "Marriage Details": ["engagement", "marriage"],
  "Employment Details": ["employment", "income"],
  "Family Details": ["father_name", "mother_name", "brother_name", "sister_name"],
  "Criminal Record": ["court_case", "police_record"],
  Expectations: ["expectation_details"],
}

/**
 * Organize connection data into sections
 * @param connectionData - Raw connection data from API
 * @returns Organized data by sections
 */
export function organizeConnectionDataIntoSections(connectionData: any) {
  const organizedData: { [sectionName: string]: { [fieldName: string]: any } } = {}

  Object.entries(connectionSectionConfig).forEach(([sectionName, fields]) => {
    organizedData[sectionName] = {}
    fields.forEach((field) => {
      if (connectionData && connectionData[field] !== undefined) {
        organizedData[sectionName][field] = connectionData[field]
      }
    })
  })

  return organizedData
}

/**
 * Format connection field for display
 * @param fieldName - Raw field name
 * @returns Formatted field name
 */
export function formatConnectionField(fieldName: string): string {
  return formatConnectionFieldName(fieldName)
}

/**
 * Get all people from connection data
 * @param connectionsData - Array of connection data
 * @returns Array of unique person emails
 */
export function getConnectionPeople(connectionsData: any[]): string[] {
  const people = new Set<string>()
  connectionsData.forEach((connection) => {
    if (connection.user_email) {
      people.add(connection.user_email)
    }
  })
  return Array.from(people)
}
