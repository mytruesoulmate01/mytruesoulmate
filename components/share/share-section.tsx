"use client"
import type { SharingRow } from "@/hooks/use-share-preferences"

interface ShareSectionProps {
  title: string
  fields: string[]
  rows: SharingRow[]
  onCheckboxChange: (index: number, field: string) => void
  showHeaders?: boolean
  columnCount?: number
}

export function ShareSection({ title, fields, rows, onCheckboxChange }: ShareSectionProps) {
  // This component is now simplified since ShareSections handles everything in unified table
  return null
}
