export interface TrustScoreSection {
  title: string
  icon: string
  fields: string[]
}

export const TRUSTSCORE_SECTIONS: TrustScoreSection[] = [
  {
    title: "Personal Details",
    icon: "👤",
    fields: ["photo", "name", "email_id", "date_of_birth", "marital_status", "religion", "caste", "mother_tongue", "phone_number", "alternate_phone"],
  },
  {
    title: "Physical Details",
    icon: "📏",
    fields: ["gender", "height_cm", "weight_kg", "complexion", "physical_disability", "diseases"],
  },
  {
    title: "Location Details",
    icon: "📍",
    fields: ["country", "state", "city", "pincode", "residential_address", "native_place"],
  },
  {
    title: "Education & Employment Details",
    icon: "🎓",
    fields: ["education_level", "education_details", "occupation", "company_name", "job_title", "annual_income", "work_location"],
  },
  {
    title: "Family Details",
    icon: "👨‍👩‍👧‍👦",
    fields: ["father_name", "father_occupation", "mother_name", "mother_occupation", "siblings_names"],
  },
  {
    title: "Lifestyle Details",
    icon: "🌿",
    fields: ["diet", "smoking", "drinking", "hobbies", "interests", "languages_known"],
  },
  {
    title: "Social Media",
    icon: "📱",
    fields: ["facebook_profile", "instagram_profile", "linkedin_profile", "twitter_profile", "whatsapp_number"],
  },
  {
    title: "Drug Test Details",
    icon: "🧪",
    fields: ["drug_test_status"],
  },
  {
    title: "CIBIL Score Details",
    icon: "📊",
    fields: ["cibil_score"],
  },
  {
    title: "Criminal Record Details",
    icon: "📋",
    fields: ["criminal_record"],
  },
]

export function organizeTrustScoreDataBySections(userData: Record<string, any>) {
  const organizedData: Record<string, Record<string, any>> = {}

  TRUSTSCORE_SECTIONS.forEach((section) => {
    const sectionData: Record<string, any> = {}

    // Include ALL fields for trust score display - show null/undefined as empty
    section.fields.forEach((field) => {
      sectionData[field] = userData ? userData[field] : null
    })

    // Always include the section (even if all values are null)
    organizedData[section.title] = sectionData
  })

  return organizedData
}
