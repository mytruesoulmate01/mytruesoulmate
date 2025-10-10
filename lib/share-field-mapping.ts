// Share-specific field mapping that organizes fields into logical sections
// Extends the existing field configuration for sharing context

import { formatShareFieldName } from "./trust-share-field-config"

export interface ShareFieldSection {
  title: string
  fields: string[]
}

// Define sections for organizing share fields
export const SHARE_SECTIONS: ShareFieldSection[] = [
  {
    title: "Personal Details",
    fields: ["name", "address", "mobile_number", "age", "gender", "email_id"],
  },
  {
    title: "Social Media Details",
    fields: ["facebook", "instagram", "twitter", "linkedin"],
  },
  {
    title: "Education & Employment",
    fields: ["education", "employment", "income"],
  },
  {
    title: "Marriage Details",
    fields: ["engagement", "marriage"],
  },
  {
    title: "Family Details",
    fields: ["father_name", "mother_name", "brother_name", "sister_name"],
  },
  {
    title: "Criminal Record",
    fields: ["court_case", "police_record"],
  },
  {
    title: "Expectations",
    fields: ["expectation_details"],
  },
]

/**
 * Get sections with only fields that exist in the available data
 * @param availableFields - Set of fields available from the API data
 * @returns Array of sections with filtered fields
 */
export function getShareSections(availableFields: Set<string>): ShareFieldSection[] {
  return SHARE_SECTIONS.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => availableFields.has(field)),
  })).filter((section) => section.fields.length > 0)
}

/**
 * Format field name for sharing display
 * @param fieldName - Raw field name from database
 * @returns Formatted field name for display
 */
export function formatShareField(fieldName: string): string {
  return formatShareFieldName(fieldName)
}
