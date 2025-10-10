import { formatConnectionField } from "@/lib/connection-field-mapping"

interface ConnectionSectionProps {
  title: string
  fields: { [fieldName: string]: any }
  people: string[]
  connectionsData: any[]
}

export function ConnectionSection({ title, fields, people, connectionsData }: ConnectionSectionProps) {
  // Get connection status for a specific field and person
  const getConnectionStatus = (fieldName: string, personEmail: string): boolean => {
    const connection = connectionsData.find((conn) => conn.user_email === personEmail)
    return connection && connection[fieldName] === true
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
              {getConnectionStatus(fieldName, personEmail) ? (
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
