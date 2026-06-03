// Trust Share field mapping for trustshare_details table

export interface TrustShareSection {
  title: string
  fields: string[]
}

// Sections for Trust Share - maps to trustshare_details table columns
export const TRUST_SHARE_SECTIONS: TrustShareSection[] = [
  {
    title: "PERSONAL DETAILS",
    fields: ["photo", "name", "email_id", "date_of_birth", "gender", "marital_status", "religion", "caste", "mother_tongue", "phone_number", "alternate_phone", "whatsapp_number"],
  },
  {
    title: "PHYSICAL DETAILS",
    fields: ["height_cm", "weight_kg", "complexion", "physical_disability", "diseases"],
  },
  {
    title: "LOCATION DETAILS",
    fields: ["country", "state", "city", "pincode", "residential_address", "native_place"],
  },
  {
    title: "EDUCATION & EMPLOYMENT DETAILS",
    fields: ["highest_education_qualification", "occupation", "company_name", "job_title", "annual_income", "work_location"],
  },
  {
    title: "FAMILY MEMBER DETAILS",
    fields: ["father_name", "father_occupation", "mother_name", "mother_occupation", "siblings_names"],
  },
  {
    title: "LIFESTYLE DETAILS",
    fields: ["diet", "smoking", "drinking", "hobbies", "interests", "languages_known"],
  },
  {
    title: "SOCIAL MEDIA",
    fields: ["facebook_profile", "instagram_profile", "linkedin_profile", "twitter_profile"],
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
  {
    title: "EXPECTATION DETAILS",
    fields: ["expectation_details"],
  },
]

// Field display labels for Trust Share
export const TRUST_SHARE_LABELS: Record<string, string> = {
  name: "Name",
  email_id: "Email ID",
  date_of_birth: "Date of Birth",
  gender: "Gender",
  marital_status: "Marital Status",
  religion: "Religion",
  caste: "Caste",
  mother_tongue: "Mother Tongue",
  phone_number: "Phone Number",
  alternate_phone: "Alternate Phone",
  whatsapp_number: "WhatsApp Number",
  height_cm: "Height (cm)",
  weight_kg: "Weight (kg)",
  blood_group: "Blood Group",
  complexion: "Complexion",
  body_type: "Body Type",
  physical_disability: "Physical Disability",
  country: "Country",
  state: "State",
  city: "City",
  pincode: "Pincode",
  residential_address: "Residential Address",
  native_place: "Native Place",
  education_level: "Education Level",
  education_details: "Education Details",
  occupation: "Occupation",
  company_name: "Company Name",
  job_title: "Job Title",
  annual_income: "Annual Income",
  work_location: "Work Location",
  father_name: "Father's Name",
  father_occupation: "Father's Occupation",
  mother_name: "Mother's Name",
  mother_occupation: "Mother's Occupation",
  siblings_count: "Number of Siblings",
  family_type: "Family Type",
  family_status: "Family Status",
  family_values: "Family Values",
  diet: "Diet",
  smoking: "Smoking",
  drinking: "Drinking",
  hobbies: "Hobbies",
  interests: "Interests",
  languages_known: "Languages Known",
  drug_test_status: "Drug Test Status",
  cibil_score: "CIBIL Score",
  criminal_record: "Criminal Record",
  expectation_details: "Expectation Details",
  photo: "Photo",
  diseases: "Pre-Existing Diseases (If Any)",
  highest_education_qualification: "Highest Education Qualification",
  siblings_names: "Siblings Names",
  facebook_profile: "Facebook Profile",
  instagram_profile: "Instagram Profile",
  linkedin_profile: "LinkedIn Profile",
  twitter_profile: "Twitter Profile",
}

// Helper function to get display label for a field
export const getTrustShareLabel = (fieldName: string): string => {
  return TRUST_SHARE_LABELS[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// Helper function to get section for a field
export const getSectionForTrustShareField = (fieldName: string): TrustShareSection | null => {
  return TRUST_SHARE_SECTIONS.find((section) => section.fields.includes(fieldName)) || null
}

// Get sections with only fields that exist in the available data
export function getTrustShareSections(availableFields: Set<string>): TrustShareSection[] {
  return TRUST_SHARE_SECTIONS.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => availableFields.has(field)),
  })).filter((section) => section.fields.length > 0)
}
