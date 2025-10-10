"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface TrustScoreData {
  userData: Record<string, any> | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useTrustScoreData(): TrustScoreData {
  const [userData, setUserData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrustScoreData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/trustscore")

      if (!response.ok) {
        throw new Error("Failed to fetch trust score data")
      }

      const data = await response.json()
      setUserData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error("Failed to load trust score data")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    await fetchTrustScoreData()
    toast.success("Trust score data refreshed")
  }

  useEffect(() => {
    fetchTrustScoreData()
  }, [])

  return {
    userData,
    loading,
    error,
    refreshData,
  }
}
