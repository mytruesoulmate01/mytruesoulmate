"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { ProfileSections } from "@/components/profile/profile-sections"

type AnyRec = Record<string, any>

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <TrustProfileContent />
    </ProtectedRoute>
  )
}

function TrustProfileContent() {
  const { user: jwtUser } = useAuth()
  const [userData, setUserData] = useState<AnyRec | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProfile = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const res = await fetch("/api/user/trustscore", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      })

      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error("Failed to fetch trustscore")

      setUserData(data.user)
    } catch (err) {
      console.error(`[ProfilePage] ❌ Failed to fetch trustscore:`, err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const isTrusted = (val: any) => !(val === "NA" || val === "Not Available" || val === null || val === undefined)

  if (!jwtUser) return null
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading trust profile...</p>
        </div>
      </div>
    )

  if (!userData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">No profile data available</p>
        </div>
      </div>
    )

  return <ProfileSections userData={userData} isTrusted={isTrusted} />
}
