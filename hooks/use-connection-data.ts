"use client"

import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

interface ConnectionData {
  person_email: string
  [key: string]: any
}

export function useConnectionData() {
  const [connectionsData, setConnectionsData] = useState<ConnectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConnectionData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/trust-connections")
      if (!response.ok) {
        throw new Error("Failed to fetch connection data")
      }

      const data = await response.json()
      setConnectionsData(data.sharedWithMe || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load connections"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshConnections = async () => {
    toast({
      title: "Refreshing...",
      description: "Fetching latest connection data",
    })

    try {
      const postResponse = await fetch("/api/user/trust-connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!postResponse.ok) {
        console.warn("Failed to update timestamp, but continuing with refresh")
      }

      await fetchConnectionData()

      toast({
        title: "Success",
        description: "Connection data refreshed successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh connection data",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchConnectionData()
  }, [])

  return {
    connectionsData,
    loading,
    error,
    refreshConnections,
  }
}
