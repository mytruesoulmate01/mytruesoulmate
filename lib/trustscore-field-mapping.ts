export interface TrustScoreSection {
  title: string
  icon: string
  fields: string[]
}

export const TRUSTSCORE_SECTIONS: TrustScoreSection[] = [
  {
    title: "Personal Details",
    icon: "👤",
    fields: ["name", "age", "gender", "date_of_birth", "address", "mobile_number", "email_id"],
  },
  {
    title: "Social Media Details",
    icon: "📱",
    fields: ["facebook", "instagram", "twitter", "linkedin"],
  },
  {
    title: "Education Details",
    icon: "🎓",
    fields: ["education", "employment"],
  },
  {
    title: "Marriage Details",
    icon: "💍",
    fields: ["marriage_status", "partner_preference"],
  },
  {
    title: "Family Details",
    icon: "👨‍👩‍👧‍👦",
    fields: ["family_background", "family_income"],
  },
  {
    title: "Criminal Record",
    icon: "⚖️",
    fields: ["criminal_record", "police_verified"],
  },
  {
    title: "Expectations",
    icon: "💭",
    fields: ["expectation_details", "partner_expectations"],
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
