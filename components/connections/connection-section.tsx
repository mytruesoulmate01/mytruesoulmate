import { formatConnectionField } from "@/lib/connection-field-mapping"

interface ConnectionSectionProps {
  title: string
  fields: { [fieldName: string]: any }
  people: string[]
  connectionsData: any[]
}

export function ConnectionSection({ title, fields, people, connectionsData }: ConnectionSectionProps) {
  // Check if a field is shared (true) for a specific person
  const isFieldShared = (fieldName: string, personEmail: string): boolean => {
    const connection = connectionsData.find((conn) => conn.person_email === personEmail)
    if (!connection) return false
    return connection[fieldName] === "true" || connection[fieldName] === true
  }

  const fieldEntries = Object.entries(fields)

  if (fieldEntries.length === 0) return null

  return (
    <>
      {/* Section Header */}
      <tr>
        <td
          colSpan={people.length + 1}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-4 py-3 text-left"
        >
          {title}
        </td>
      </tr>

      {/* Section Fields */}
      {fieldEntries.map(([fieldName, _]) => (
        <tr key={fieldName} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
            {formatConnectionField(fieldName)}
          </td>
          {people.map((personEmail) => (
            <td key={personEmail} className="px-4 py-3 text-center border-r border-gray-200">
              {isFieldShared(fieldName, personEmail) ? (
                <span className="text-green-600 text-lg">✅</span>
              ) : (
                <span className="text-red-500 text-lg">❌</span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
