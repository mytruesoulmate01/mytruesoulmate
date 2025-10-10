"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [trustScore, setTrustScore] = useState<number | null>(null)
  const [isLoadingScore, setIsLoadingScore] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchTrustScore() {
      if (!user) return

      setIsLoadingScore(true)
      try {
        const response = await fetch("/api/user/trustscore")
        const data = await response.json()

        if (response.ok) {
          setTrustScore(data.trustScore)
        }
      } catch (error) {
        console.error("Failed to fetch trust score:", error)
      } finally {
        setIsLoadingScore(false)
      }
    }

    fetchTrustScore()
    // Redirect to profile page when accessing /dashboard
    router.replace("/dashboard/profile")
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  )
}
