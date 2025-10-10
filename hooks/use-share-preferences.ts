"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export interface SharingRow {
  recipientEmail: string
  [field: string]: string | boolean
}

export function useSharePreferences() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rows, setRows] = useState<SharingRow[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const res = await fetch("/api/user/save-preferences", { cache: "no-store" })
        const data = await res.json()

        if (data.success) {
          const ignoredKeys = new Set(["user_id", "user_email", "recipient_email", "details_shared", "recipient_id"])

          const uniqueFields = new Set<string>()
          data.sharingData.forEach((entry: any) => {
            Object.keys(entry).forEach((key) => {
              if (!ignoredKeys.has(key)) uniqueFields.add(key)
            })
          })

          const formattedRows = data.sharingData.map((entry: any) => {
            const formatted: SharingRow = {
              recipientEmail: entry.recipient_email || "",
            }
            Array.from(uniqueFields).forEach((field) => {
              formatted[field] = entry[field] ?? false
            })
            return formatted
          })

          setFields(Array.from(uniqueFields))
          setRows(formattedRows)
        }
      } catch (error) {
        console.error("Error fetching share preferences:", error)
        toast({
          title: "Error loading data",
          description: "Failed to load sharing preferences",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [user, toast])

  const handleInputChange = (index: number, value: string) => {
    const updatedRows = [...rows]
    updatedRows[index].recipientEmail = value
    setRows(updatedRows)
  }

  const handleCheckboxChange = (index: number, field: string) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = !updatedRows[index][field]
    setRows(updatedRows)
  }

  const handleAddPerson = () => {
    if (rows.length >= 5) {
      toast({
        title: "Limit reached",
        description: "You can only share with up to 5 people.",
        variant: "destructive",
      })
      return
    }

    const newRow: SharingRow = { recipientEmail: "" }
    fields.forEach((f) => (newRow[f] = false))
    setRows([...rows, newRow])
  }

  const handleDeletePerson = async (index: number) => {
    const recipientEmail = rows[index].recipientEmail?.trim()

    if (!recipientEmail) {
      const updatedRows = [...rows]
      updatedRows.splice(index, 1)
      setRows(updatedRows)
      return
    }

    try {
      const res = await fetch("/api/user/save-preferences", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientEmail }),
      })

      const data = await res.json()
      if (data.success) {
        const updatedRows = [...rows]
        updatedRows.splice(index, 1)
        setRows(updatedRows)
        toast({
          title: "Entry deleted",
          description: `${recipientEmail} removed from your sharing list.`,
        })
      } else {
        toast({
          title: "Failed to delete",
          description: data.message ?? "Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting person:", err)
      toast({
        title: "Server error",
        description: "There was a problem deleting the entry.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const payload = rows.map((row) => {
        const { recipientEmail, ...rest } = row
        return {
          recipientEmail: recipientEmail?.trim(),
          ...rest,
        }
      })

      const res = await fetch("/api/user/save-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Preferences saved",
          description: "Your sharing preferences have been updated.",
        })
      } else {
        toast({
          title: "Save failed",
          description: data.message ?? "Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: "Couldn't reach the server. Try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return {
    rows,
    fields,
    isSaving,
    isLoading,
    handleInputChange,
    handleCheckboxChange,
    handleAddPerson,
    handleDeletePerson,
    handleSave,
  }
}
