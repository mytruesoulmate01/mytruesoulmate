export interface TrustScoreSection {
  title: string
  icon: string
  fields: string[]
}

export const TRUSTSCORE_SECTIONS: TrustScoreSection[] = [
  {
    title: "Personal Details",
    icon: "👤",
    fields: ["date_of_birth", "gender", "marital_status", "religion", "caste", "mother_tongue", "phone_number", "alternate_phone", "whatsapp_number"],
  },
  {
    title: "Physical Details",
    icon: "📏",
    fields: ["height_cm", "weight_kg", "blood_group", "complexion", "body_type", "physical_disability"],
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
    fields: ["father_name", "father_occupation", "mother_name", "mother_occupation", "siblings_count", "family_type", "family_status", "family_values"],
  },
  {
    title: "Lifestyle Details",
    icon: "🌿",
    fields: ["diet", "smoking", "drinking", "hobbies", "interests", "languages_known"],
  },
]

export function organizeTrustScoreDataBySections(userData: Record<string, any>) {
  const organizedData: Record<string, Record<string, any>> = {}

  TRUSTSCORE_SECTIONS.forEach((section) => {
    const sectionData: Record<string, any> = {}

    section.fields.forEach((field) => {
      if (userData && userData[field] !== undefined) {
        sectionData[field] = userData[field]
      }
    })

    if (Object.keys(sectionData).length > 0) {
      organizedData[section.title] = sectionData
    }
  })

  return organizedData
}
