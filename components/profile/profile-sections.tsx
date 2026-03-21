import { PROFILE_SECTIONS, organizeDataBySections } from "@/lib/profile-field-mapping"
import { ProfileSection } from "./profile-section"
import { TrustScoreBadge } from "./trust-score-badge"

interface ProfileSectionsProps {
  userData: Record<string, any>
  isTrusted: (value: any) => boolean
}

export function ProfileSections({ userData, isTrusted }: ProfileSectionsProps) {
  console.log("[v0] ProfileSections userData:", userData)
  const organizedData = organizeDataBySections(userData)
  console.log("[v0] Organized data:", organizedData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <TrustScoreBadge trustScore={userData?.truscore} />

        <div className="bg-red-600 text-white px-6 py-4 rounded-lg mb-8">
          <h1 className="text-2xl font-bold text-left">TrustProfile</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {PROFILE_SECTIONS.map((section) => {
            const sectionData = organizedData[section.title]

            if (!sectionData || Object.keys(sectionData).length === 0) {
              return null
            }

            return (
              <ProfileSection
                key={section.title}
                title={section.title}
                icon={section.icon}
                data={sectionData}
                isTrusted={isTrusted}
              />
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Profile data is verified and updated regularly for trust and authenticity
          </p>
        </div>
      </div>
    </div>
  )
}
