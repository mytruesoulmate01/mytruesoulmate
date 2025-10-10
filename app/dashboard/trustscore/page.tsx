"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import ProtectedRoute from "@/components/protected-route"
import { TrustScoreSections } from "@/components/trustscore/trustscore-sections"
import { TrustScoreBadge } from "@/components/profile/trust-score-badge"

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

  const totalTrustScore = userData
    ? Object.entries(userData)
        .filter(([key]) => key !== "user_id" && key !== "truscore")
        .reduce((sum, [, value]) => sum + (isTrusted(value) ? 5 : 0), 0)
    : 0

  if (!jwtUser) return null
  if (loading) return <div className="p-8 text-lg">Loading trust profile...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <TrustScoreBadge trustScore={userData?.truscore} />

        <div className="bg-red-600 text-white px-6 py-4 rounded-lg mb-8">
          <h1 className="text-2xl font-bold text-left">TrustScore</h1>
        </div>

        {userData && <TrustScoreSections userData={userData} isTrusted={isTrusted} />}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg">
            Trust Score: {totalTrustScore}
          </div>

          <Button
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {refreshing ? "Refreshing..." : "Refresh Trustscore"}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trust score is calculated based on verified information and updated regularly
          </p>
        </div>
      </div>
    </div>
  )
}
