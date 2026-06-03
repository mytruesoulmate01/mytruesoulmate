export interface ProfileSection {
  title: string
  fields: string[]
  icon?: string
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    title: "PERSONAL DETAILS",
    fields: ["photo", "name", "email_id", "date_of_birth", "marital_status", "religion", "caste", "mother_tongue", "phone_number", "alternate_phone"],
  },
  {
    title: "PHYSICAL DETAILS",
    fields: ["gender", "height_cm", "weight_kg", "complexion", "physical_disability", "diseases"],
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
    fields: ["facebook_profile", "instagram_profile", "linkedin_profile", "twitter_profile", "whatsapp_number"],
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
  {
    title: "REFERENCE DETAILS",
    fields: ["reference1", "reference2"],
  },
]

// Field display labels for better readability
export const FIELD_LABELS: Record<string, string> = {
  photo: "Photo",
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
  facebook_profile: "Facebook Profile",
  instagram_profile: "Instagram Profile",
  linkedin_profile: "LinkedIn Profile",
  twitter_profile: "Twitter Profile",
  height_cm: "Height (cm)",
  weight_kg: "Weight (kg)",
  blood_group: "Blood Group",
  complexion: "Complexion",
  body_type: "Body Type",
  physical_disability: "Physical Disability",
  diseases: "Pre-Existing Diseases (If Any)",
  country: "Country",
  state: "State",
  city: "City",
  pincode: "Pincode",
  residential_address: "Residential Address",
  native_place: "Native Place",
  highest_education_qualification: "Highest Education Qualification",
  occupation: "Occupation",
  company_name: "Company Name",
  job_title: "Job Title",
  annual_income: "Annual Income",
  work_location: "Work Location",
  father_name: "Father's Name",
  father_occupation: "Father's Occupation",
  mother_name: "Mother's Name",
  mother_occupation: "Mother's Occupation",
  siblings_names: "Siblings Names",
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
  reference1: "Reference 1",
  reference2: "Reference 2",
}

// Helper function to get display label for a field
export const getFieldLabel = (fieldName: string): string => {
  return FIELD_LABELS[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// Helper function to get section for a field
export const getSectionForField = (fieldName: string): ProfileSection | null => {
  return PROFILE_SECTIONS.find((section) => section.fields.includes(fieldName)) || null
}

// Get all profile fields that count towards trust score
export const getAllProfileFields = (): string[] => {
  return PROFILE_SECTIONS.flatMap((section) => section.fields)
}

// Get max possible trust score (total number of profile fields)
export const getMaxTrustScore = (): number => {
  return getAllProfileFields().length
}

// Check if a value is valid (not null, undefined, empty array, or placeholder values)
export const isFieldFilled = (val: any): boolean => {
  if (val === null || val === undefined) return false
  if (val === "NA" || val === "Not Available") return false
  if (Array.isArray(val) && val.length === 0) return false
  if (val === 0 || val === "0") return false
  if (typeof val === "string" && val.trim() === "") return false
  return true
}

// Calculate trust score from user data
export const calculateTrustScore = (userData: Record<string, any>): { score: number; maxScore: number; percentage: number } => {
  const profileFields = getAllProfileFields()
  const score = profileFields.reduce((sum, field) => sum + (isFieldFilled(userData[field]) ? 1 : 0), 0)
  const maxScore = profileFields.length
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  return { score, maxScore, percentage }
}

// Helper function to organize user data by sections
export const organizeDataBySections = (userData: Record<string, any>) => {
  const organizedData: Record<string, Record<string, any>> = {}

  PROFILE_SECTIONS.forEach((section) => {
    organizedData[section.title] = {}
    section.fields.forEach((field) => {
      if (userData[field] !== undefined) {
        organizedData[section.title][field] = userData[field]
      }
    })
  })

  return organizedData
}
