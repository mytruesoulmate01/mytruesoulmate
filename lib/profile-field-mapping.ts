export interface ProfileSection {
  title: string
  fields: string[]
  icon?: string
}

export const PROFILE_SECTIONS: ProfileSection[] = [
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
    title: "PARTNER PREFERENCES",
    fields: ["partner_age_min", "partner_age_max", "partner_height_min", "partner_height_max", "partner_education", "partner_occupation", "partner_income_min", "partner_religion", "partner_caste", "partner_marital_status", "partner_location"],
  },
  {
    title: "ABOUT ME & EXPECTATIONS",
    fields: ["about_me", "expectations"],
  },
]

// Field display labels for better readability
export const FIELD_LABELS: Record<string, string> = {
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
  partner_age_min: "Partner Age (Min)",
  partner_age_max: "Partner Age (Max)",
  partner_height_min: "Partner Height (Min)",
  partner_height_max: "Partner Height (Max)",
  partner_education: "Partner Education",
  partner_occupation: "Partner Occupation",
  partner_income_min: "Partner Income (Min)",
  partner_religion: "Partner Religion",
  partner_caste: "Partner Caste",
  partner_marital_status: "Partner Marital Status",
  partner_location: "Partner Location",
  about_me: "About Me",
  expectations: "Expectations",
}

// Helper function to get display label for a field
export const getFieldLabel = (fieldName: string): string => {
  return FIELD_LABELS[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// Helper function to get section for a field
export const getSectionForField = (fieldName: string): ProfileSection | null => {
  return PROFILE_SECTIONS.find((section) => section.fields.includes(fieldName)) || null
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
