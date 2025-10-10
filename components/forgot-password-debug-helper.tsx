"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ForgotPasswordDebugHelper() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setIsLoading(true)
    try {
      // Get current environment info
      const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        cookies: document.cookie,
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length,
        environment: process.env.NODE_ENV,
      }
      setDebugInfo(info)
    } catch (error) {
      console.error("Debug info fetch failed:", error)
      setDebugInfo({ error: "Failed to fetch debug info" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
          Debug Information
          <Badge variant="outline" className="text-xs">
            Development Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={fetchDebugInfo}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="mb-3 bg-transparent"
        >
          {isLoading ? "Loading..." : "Fetch Debug Info"}
        </Button>

        {debugInfo && (
          <div className="bg-white rounded border p-3 text-xs font-mono">
            <pre className="whitespace-pre-wrap text-gray-700">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <div className="mt-3 text-xs text-yellow-700">
          <p>This debug panel helps troubleshoot forgot password issues:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Check browser environment and cookies</li>
            <li>Verify API request/response data</li>
            <li>Monitor network connectivity</li>
            <li>Debug email delivery issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
