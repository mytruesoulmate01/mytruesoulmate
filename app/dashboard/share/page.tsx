"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SHARE_SECTIONS, ALL_SHARE_FIELDS, formatShareField } from "@/lib/share-field-mapping"
import { useToast } from "@/components/ui/use-toast"
import { ChevronDown, ChevronRight, Pencil, Trash2, Check, X } from "lucide-react"

interface RecipientInfo {
  id: string
  email: string
  name: string
}

interface FieldSelections {
  [field: string]: boolean
}

interface SharedEntry {
  id: string
  trustshare_email_id: string
  [field: string]: string | boolean
}

export default function SharingPreferencesPage() {
  return (
    <ProtectedRoute>
      <SharingPreferencesContent />
    </ProtectedRoute>
  )
}

function SharingPreferencesContent() {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null)
  const [fieldSelections, setFieldSelections] = useState<FieldSelections>(() => {
    const initial: FieldSelections = {}
    ALL_SHARE_FIELDS.forEach((field) => {
      initial[field] = false
    })
    return initial
  })
  
  // State for existing shared entries
  const [sharedEntries, setSharedEntries] = useState<SharedEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(true)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)

  // Fetch existing shared entries on mount
  useEffect(() => {
    fetchSharedEntries()
  }, [])

  const fetchSharedEntries = async () => {
    try {
      setIsLoadingEntries(true)
      const res = await fetch("/api/user/save-preferences", { cache: "no-store" })
      const data = await res.json()
      if (data.success && data.sharingData) {
        setSharedEntries(data.sharingData)
      }
    } catch (error) {
      console.error("Error fetching shared entries:", error)
    } finally {
      setIsLoadingEntries(false)
    }
  }

  // Handle edit existing entry
  const handleEditEntry = (entry: SharedEntry) => {
    setEditingEntry(entry.id)
    setRecipient({
      id: entry.trustshare_email_id,
      email: entry.trustshare_email_id,
      name: "User"
    })
    // Set field selections from existing entry
    const selections: FieldSelections = {}
    ALL_SHARE_FIELDS.forEach((field) => {
      selections[field] = entry[field] === "true" || entry[field] === true
    })
    setFieldSelections(selections)
    setStep(2)
  }

  // Handle delete entry
  const handleDeleteEntry = async (entryEmail: string) => {
    try {
      const res = await fetch("/api/user/save-preferences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: entryEmail }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Deleted",
          description: "Sharing entry removed successfully",
        })
        fetchSharedEntries()
      } else {
        toast({
          title: "Delete failed",
          description: data.message || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    }
  }

  // Count shared fields for an entry
  const countSharedFields = (entry: SharedEntry): number => {
    return ALL_SHARE_FIELDS.filter(field => entry[field] === "true" || entry[field] === true).length
  }

  // Step 1: Validate email
  const handleValidateEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsValidating(true)
      const res = await fetch("/api/user/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        setRecipient(data.recipient)
        setStep(2)
        toast({
          title: "User found",
          description: `Sharing with ${data.recipient.name} (${data.recipient.email})`,
        })
      } else {
        toast({
          title: "User not found",
          description: data.message || "User not registered",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Toggle field selection
  const handleFieldToggle = (field: string) => {
    setFieldSelections((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Select/Deselect all fields in a section
  const handleSectionToggle = (fields: string[], selectAll: boolean) => {
    setFieldSelections((prev) => {
      const updated = { ...prev }
      fields.forEach((field) => {
        updated[field] = selectAll
      })
      return updated
    })
  }

  // Save sharing preferences
  const handleSave = async () => {
    if (!recipient) return

    const selectedFields = Object.entries(fieldSelections)
      .filter(([_, selected]) => selected)
      .map(([field]) => field)

    if (selectedFields.length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field to share",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch("/api/user/save-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipient.email,
          recipientId: recipient.id,
          fields: fieldSelections,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Preferences saved",
          description: `Successfully shared ${selectedFields.length} fields with ${recipient.name}`,
        })
        // Reset to step 1
        setStep(1)
        setEmail("")
        setRecipient(null)
        setEditingEntry(null)
        setFieldSelections(() => {
          const initial: FieldSelections = {}
          ALL_SHARE_FIELDS.forEach((field) => {
            initial[field] = false
          })
          return initial
        })
        // Refresh shared entries list
        fetchSharedEntries()
      } else {
        toast({
          title: "Save failed",
          description: data.message || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Go back to step 1
  const handleBack = () => {
    setStep(1)
    setRecipient(null)
    setEditingEntry(null)
    setFieldSelections(() => {
      const initial: FieldSelections = {}
      ALL_SHARE_FIELDS.forEach((field) => {
        initial[field] = false
      })
      return initial
    })
  }

  return (
    <div className="p-6">
      <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-6">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-semibold">TrustShare</CardTitle>
        </CardHeader>
      </Card>

      {/* Existing Shared Entries Section */}
      {step === 1 && sharedEntries.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="bg-gray-100 dark:bg-gray-700 py-3">
            <CardTitle className="text-lg">Your Shared Connections</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingEntries ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-2">
                {sharedEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg overflow-hidden">
                    {/* Collapsible Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-700 cursor-pointer hover:from-red-100 hover:to-rose-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors"
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedEntry === entry.id ? (
                          <ChevronDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-red-600">
                            TrustShare - {entry.trustshare_email_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {countSharedFields(entry)} fields shared
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEntry(entry)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.trustshare_email_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {expandedEntry === entry.id && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {ALL_SHARE_FIELDS.map((field) => {
                            const isShared = entry[field] === "true" || entry[field] === true
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
                                <span>{formatShareField(field)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 ? (
        // Step 1: Email Input
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  Enter recipient&apos;s email address
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your profile details with a registered user
                </p>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleValidateEmail()}
                className="text-lg py-6"
              />
              <Button
                onClick={handleValidateEmail}
                disabled={isValidating || !email.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 
                 text-white font-semibold py-6 text-lg rounded-lg shadow-lg transition-all 
                 duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isValidating ? "Validating..." : "Share Details"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Step 2: Field Selection
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">
                {editingEntry ? "Editing share for: " : "Sharing with: "}
                <span className="text-red-600">{recipient?.email}</span>
              </p>
              {editingEntry && (
                <p className="text-sm text-blue-600">Modify the fields you want to share</p>
              )}
            </div>
            <Button variant="outline" onClick={handleBack}>
              ← {editingEntry ? "Cancel Edit" : "Change Recipient"}
            </Button>
          </div>

          <p className="text-muted-foreground">
            Select which details you want to share. Check the boxes next to the fields you want to share.
          </p>

          {SHARE_SECTIONS.map((section) => {
            const allSelected = section.fields.every((f) => fieldSelections[f])
            const someSelected = section.fields.some((f) => fieldSelections[f])

            return (
              <Card key={section.title} className="overflow-hidden">
                <CardHeader className="bg-gray-100 dark:bg-gray-700 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSectionToggle(section.fields, !allSelected)}
                      className="text-sm"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.fields.map((field) => (
                      <label
                        key={field}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={fieldSelections[field] || false}
                          onChange={() => handleFieldToggle(field)}
                          className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm">{formatShareField(field)}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 
               text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg transition-all 
               duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving ? "Saving..." : editingEntry ? "Update & Share" : "Save & Share"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
