// Share-specific field mapping that organizes fields into logical sections
// Synced with profile-field-mapping.ts for consistency

import { FIELD_LABELS } from "./profile-field-mapping"

export interface ShareFieldSection {
  title: string
  fields: string[]
}

// Define sections for organizing share fields (same as profile-field-mapping.ts)
export const SHARE_SECTIONS: ShareFieldSection[] = [
  {
    title: "PERSONAL DETAILS",
    fields: ["date_of_birth", "gender", "marital_status", "religion", "caste", "mother_tongue", "phone_number", "alternate_phone", "whatsapp_number"],
  },
  {
    title: "PHYSICAL DETAILS",
    fields: ["height_cm", "weight_kg", "blood_group", "complexion", "body_type", "physical_disability"],
  },
  {
    title: "LOCATION DETAILS",
    fields: ["country", "state", "city", "pincode", "residential_address", "native_place"],
  },
  {
    title: "EDUCATION & EMPLOYMENT DETAILS",
    fields: ["education_level", "education_details", "occupation", "company_name", "job_title", "annual_income", "work_location"],
  },
  {
    title: "FAMILY MEMBER DETAILS",
    fields: ["father_name", "father_occupation", "mother_name", "mother_occupation", "siblings_count", "family_type", "family_status", "family_values"],
  },
  {
    title: "LIFESTYLE DETAILS",
    fields: ["diet", "smoking", "drinking", "hobbies", "interests", "languages_known"],
  },
  {
    title: "DRUG TEST DETAILS",
    fields: ["drug_test_status"],
  },
  {
    title: "CIBIL SCORE DETAILS",
    fields: ["cibil_score"],
  },
  {
    title: "CRIMINAL RECORD DETAILS",
    fields: ["criminal_record"],
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
  return FIELD_LABELS[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}
