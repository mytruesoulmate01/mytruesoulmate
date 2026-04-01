"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useConnectionData } from "@/hooks/use-connection-data"
import { ChevronDown, ChevronRight, Check, X } from "lucide-react"
import { TRUST_SHARE_SECTIONS, TRUST_SHARE_LABELS } from "@/lib/trust-share-mapping"

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
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  // Count shared fields for an entry
  const countSharedFields = (entry: any): number => {
    let count = 0
    TRUST_SHARE_SECTIONS.forEach((section) => {
      section.fields.forEach((field) => {
        if (entry[field] === true) count++
      })
    })
    return count
  }

  // Format field name for display
  const formatField = (field: string): string => {
    return TRUST_SHARE_LABELS[field] || field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold">TrustConnection</CardTitle>
          </CardHeader>
        </Card>

        {/* Connection Details Section */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-100 dark:bg-gray-700 py-3">
            <CardTitle className="text-lg">Trust Connection Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-muted-foreground mb-4">Below are the details that others have shared with you.</p>

            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : connectionsData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No one has shared their details with you yet.
              </p>
            ) : (
              <div className="space-y-2">
                {connectionsData.map((entry: any, index: number) => (
                  <div key={entry.sharer_id || index} className="border rounded-lg overflow-hidden">
                    {/* Collapsible Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-700 cursor-pointer hover:from-red-100 hover:to-rose-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors"
                      onClick={() => setExpandedEntry(expandedEntry === entry.sharer_id ? null : entry.sharer_id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedEntry === entry.sharer_id ? (
                          <ChevronDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-red-600">
                            TrustConnection - {entry.person_email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {countSharedFields(entry)} fields shared with you
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedEntry === entry.sharer_id && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t">
                        {TRUST_SHARE_SECTIONS.map((section) => {
                          const sharedFieldsInSection = section.fields.filter((field) => entry[field] === true)
                          if (sharedFieldsInSection.length === 0) return null

                          return (
                            <div key={section.title} className="mb-4">
                              <h4 className="font-semibold text-red-600 mb-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
                                {section.title}
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {section.fields.map((field) => {
                                  const isShared = entry[field] === true
                                  return (
                                    <div
                                      key={field}
                                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                                        isShared
                                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                          : "bg-gray-50 text-gray-400 dark:bg-gray-900/20"
                                      }`}
                                    >
                                      {isShared ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                      <span>{formatField(field)}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button
            onClick={refreshConnections}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Updating..." : "Refresh Details"}
          </Button>
        </div>
      </div>
    </div>
  )
}
