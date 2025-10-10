"use client"

import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConnectionSections } from "@/components/connections/connection-sections"
import { useConnectionData } from "@/hooks/use-connection-data"

export default function TrustConnectionsPage() {
  return (
    <ProtectedRoute>
      <TrustConnectionsContent />
    </ProtectedRoute>
  )
}

function TrustConnectionsContent() {
  const { user } = useAuth()
  const { connectionsData, loading, refreshConnections } = useConnectionData()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold">TrustConnection</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">Below are the details that others have shared with you.</p>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading connection data...</div>
            ) : (
              <ConnectionSections connectionsData={connectionsData} />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button
            onClick={refreshConnections}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Updating..." : " Get All Details"}
          </Button>
        </div>
      </div>
    </div>
  )
}
