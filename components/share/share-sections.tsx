"use client"

import { getShareSections, formatShareField } from "@/lib/share-field-mapping"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { SharingRow } from "@/hooks/use-share-preferences"

interface ShareSectionsProps {
  rows: SharingRow[]
  fields: string[]
  onInputChange: (index: number, value: string) => void
  onCheckboxChange: (index: number, field: string) => void
  onDeletePerson: (index: number) => void
}

export function ShareSections({ rows, fields, onInputChange, onCheckboxChange, onDeletePerson }: ShareSectionsProps) {
  const availableFields = new Set(fields)
  const sections = getShareSections(availableFields)

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-red-100 px-4 py-3 font-bold uppercase text-gray-800 text-left w-80">
                Trust Details
              </th>
              {rows.map((_, idx) => (
                <th key={idx} className="border border-gray-300 bg-pink-100 px-4 py-3 min-w-[200px]">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-gray-700">Email-ID of Person</div>
                    <Input
                      placeholder="Enter email address"
                      className="text-center text-sm h-8"
                      value={rows[idx].recipientEmail}
                      onChange={(e) => onInputChange(idx, e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeletePerson(idx)}
                      className="w-full text-xs h-7"
                    >
                      Delete
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <>
                {/* Section Header Row */}
                <tr key={`section-${section.title}`}>
                  <td
                    colSpan={rows.length + 1}
                    className="border border-gray-300 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 font-semibold text-lg"
                  >
                    {section.title}
                  </td>
                </tr>
                {/* Section Fields */}
                {section.fields.map((field) => (
                  <tr key={field}>
                    <td className="border border-gray-300 px-4 py-3 bg-gray-100 dark:bg-gray-700 font-medium">
                      {formatShareField(field)}
                    </td>
                    {rows.map((row, rowIdx) => (
                      <td
                        key={`${field}-${rowIdx}`}
                        className="border border-gray-300 text-center py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <Checkbox checked={!!row[field]} onCheckedChange={() => onCheckboxChange(rowIdx, field)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
