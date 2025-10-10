"use client"

import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ShareSections } from "@/components/share/share-sections"
import { useSharePreferences } from "@/hooks/use-share-preferences"

export default function SharingPreferencesPage() {
  return (
    <ProtectedRoute>
      <SharingPreferencesContent />
    </ProtectedRoute>
  )
}

function SharingPreferencesContent() {
  const {
    rows,
    fields,
    isSaving,
    isLoading,
    handleInputChange,
    handleCheckboxChange,
    handleAddPerson,
    handleDeletePerson,
    handleSave,
  } = useSharePreferences()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading sharing preferences...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-6">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-semibold">TrustShare</CardTitle>
        </CardHeader>
      </Card>

      <p className="text-muted-foreground mb-6">Select which details you want to share with specific people</p>

      <ShareSections
        rows={rows}
        fields={fields}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onDeletePerson={handleDeletePerson}
      />

      <div className="mt-6 flex gap-4">
        <Button onClick={handleAddPerson} variant="outline">
          ➕ Add Person
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 
           text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg transition-all 
           duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
