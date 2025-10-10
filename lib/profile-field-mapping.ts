export interface ProfileSection {
  title: string
  fields: string[]
  icon?: string
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    title: "PERSONAL DETAILS",
    fields: ["name", "address", "mobile_number", "age", "gender", "email_id"],
    icon: "👤",
  },
  {
    title: "SOCIAL MEDIA DETAILS",
    fields: ["facebook", "instagram", "twitter", "linkedin"],
    icon: "📱",
  },
  {
    title: "EDUCATION & EMPLOYMENT DETAILS",
    fields: ["education", "employment", "income"],
    icon: "🎓",
  },
  {
    title: "MARRIAGE DETAILS",
    fields: ["engagement", "marriage"],
    icon: "💍",
  },
  {
    title: "FAMILY MEMBER DETAILS",
    fields: ["father_name", "mother_name", "brother_name", "sister_name"],
    icon: "👨‍👩‍👧‍👦",
  },
  {
    title: "CRIMINAL RECORD DETAILS",
    fields: ["court_case", "police_record"],
    icon: "⚖️",
  },
  {
    title: "EXPECTATION DETAILS",
    fields: ["expectation_details"],
    icon: "💭",
  },
]

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
