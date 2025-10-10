"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle, Clock, Database, Route, Settings } from "lucide-react"

interface RouteCheckResult {
  success: boolean
  routes: {
    [key: string]: {
      exists: boolean
      path: string
    }
  }
  timestamp: string
  error?: string
}

export function ResetPasswordDebugHelper() {
  const searchParams = useSearchParams()
  const [routeCheck, setRouteCheck] = useState<RouteCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get("token")
  const currentUrl = typeof window !== "undefined" ? window.location.href : "unknown"

  const checkRoutes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug/check-routes")
      const data = await response.json()
      setRouteCheck(data)
    } catch (error) {
      console.error("Failed to check routes:", error)
      setRouteCheck({
        success: false,
        routes: {},
        timestamp: new Date().toISOString(),
        error: "Failed to fetch route information",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkRoutes()
  }, [])

  return (
    <div className="mt-6 space-y-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Reset Password Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {/* Component Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Route className="w-3 h-3 text-orange-600" />
              <span className="font-medium text-orange-900">Component Info</span>
            </div>
            <div className="pl-5 space-y-1 text-orange-800">
              <div>Component: ResetPasswordPage</div>
              <div>Route: /reset-password</div>
              <div>
                Status:{" "}
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </div>

          {/* URL & Token Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3 text-orange-600" />
              <span className="font-medium text-orange-900">URL & Token Info</span>
            </div>
            <div className="pl-5 space-y-1 text-orange-800">
              <div>Current URL: {currentUrl}</div>
              <div>
                Token Present:{" "}
                {token ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    No
                  </Badge>
                )}
              </div>
              {token && (
                <>
                  <div>Token Length: {token.length}</div>
                  <div>Token Preview: {token.substring(0, 20)}...</div>
                </>
              )}
            </div>
          </div>

          {/* Route File Check */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-orange-600" />
              <span className="font-medium text-orange-900">Route File Check</span>
              <Button
                onClick={checkRoutes}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-transparent"
              >
                {isLoading ? "Checking..." : "Refresh"}
              </Button>
            </div>
            {routeCheck && (
              <div className="pl-5 space-y-1 text-orange-800">
                {routeCheck.success ? (
                  Object.entries(routeCheck.routes).map(([routeName, routeInfo]) => (
                    <div key={routeName} className="flex items-center gap-2">
                      {routeInfo.exists ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span>
                        {routeName}: {routeInfo.exists ? "EXISTS" : "MISSING"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-3 h-3" />
                    <span>Error: {routeCheck.error || "Failed to check routes"}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>Last checked: {new Date(routeCheck.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Environment Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3 text-orange-600" />
              <span className="font-medium text-orange-900">Environment Info</span>
            </div>
            <div className="pl-5 space-y-1 text-orange-800">
              <div>Environment: {process.env.NODE_ENV || "unknown"}</div>
              <div>Vercel URL: {process.env.NEXT_PUBLIC_VERCEL_URL || "localhost"}</div>
              <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || "not set"}</div>
            </div>
          </div>

          {/* Debug Instructions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-orange-600" />
              <span className="font-medium text-orange-900">Debug Instructions</span>
            </div>
            <div className="pl-5 space-y-1 text-orange-800">
              <div>• Check browser console for detailed logs</div>
              <div>• Verify token is present in URL parameters</div>
              <div>• Ensure all route files exist and are deployed</div>
              <div>• Check network tab for API request/response</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
