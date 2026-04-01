// Share-specific field mapping that organizes fields into logical sections
// Synced with profile-field-mapping.ts for consistency

import { PROFILE_SECTIONS, FIELD_LABELS, getFieldLabel } from "./profile-field-mapping"

export interface ShareFieldSection {
  title: string
  fields: string[]
}

// Use same sections as profile-field-mapping.ts
export const SHARE_SECTIONS: ShareFieldSection[] = PROFILE_SECTIONS.map((section) => ({
  title: section.title,
  fields: [...section.fields],
}))

// Get all shareable fields
export const ALL_SHARE_FIELDS = SHARE_SECTIONS.flatMap((section) => section.fields)

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
  return getFieldLabel(fieldName)
}
