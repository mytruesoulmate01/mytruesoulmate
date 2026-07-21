"use client"

import { ProfileSections } from "@/components/profile/profile-sections"

interface ProfileClientProps {
  profile: Record<string, any> | null
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const isTrusted = (val: any) => {
    if (val === null || val === undefined) return false
    if (val === "NA" || val === "Not Available") return false
    if (Array.isArray(val) && val.length === 0) return false
    if (typeof val === "string" && val.trim() === "") return false
    return true
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">No profile data available</p>
        </div>
      </div>
    )
  }

  return <ProfileSections userData={profile} isTrusted={isTrusted} />
}
