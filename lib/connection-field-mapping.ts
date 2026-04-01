import { TRUST_SHARE_SECTIONS, TRUST_SHARE_LABELS } from "./trust-share-mapping"

// Build section configuration from TRUST_SHARE_SECTIONS
export const connectionSectionConfig: { [key: string]: string[] } = {}
TRUST_SHARE_SECTIONS.forEach((section) => {
  connectionSectionConfig[section.title] = section.fields
})

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
  return TRUST_SHARE_LABELS[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Get all people from connection data
 * @param connectionsData - Array of connection data
 * @returns Array of unique person emails
 */
export function getConnectionPeople(connectionsData: any[]): string[] {
  const people = new Set<string>()
  connectionsData.forEach((connection) => {
    if (connection.person_email) {
      people.add(connection.person_email)
    }
  })
  return Array.from(people)
}
