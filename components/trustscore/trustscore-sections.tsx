import { TRUSTSCORE_SECTIONS, organizeTrustScoreDataBySections } from "@/lib/trustscore-field-mapping"
import { TrustScoreSection } from "./trustscore-section"

interface TrustScoreSectionsProps {
  userData: Record<string, any>
  isTrusted: (value: any) => boolean
}

export function TrustScoreSections({ userData, isTrusted }: TrustScoreSectionsProps) {
  const organizedData = organizeTrustScoreDataBySections(userData)

  return (
    <div className="grid grid-cols-1 gap-6">
      {TRUSTSCORE_SECTIONS.map((section) => {
        const sectionData = organizedData[section.title]

        if (!sectionData || Object.keys(sectionData).length === 0) {
          return null
        }

        return (
          <TrustScoreSection
            key={section.title}
            title={section.title}
            icon={section.icon}
            data={sectionData}
            isTrusted={isTrusted}
          />
        )
      })}
    </div>
  )
}
