import { ConnectionSection } from "./connection-section"
import { organizeConnectionDataIntoSections, getConnectionPeople } from "@/lib/connection-field-mapping"

interface ConnectionSectionsProps {
  connectionsData: any[]
}

export function ConnectionSections({ connectionsData }: ConnectionSectionsProps) {
  const people = getConnectionPeople(connectionsData)

  if (connectionsData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trust connections found. Share your details with others to see connections here.
      </div>
    )
  }

  // Get all unique fields from all connections
  const allFields: { [key: string]: any } = {}
  connectionsData.forEach((connection) => {
    Object.keys(connection).forEach((key) => {
      if (key !== "person_email") {
        allFields[key] = true
      }
    })
  })

  const organizedData = organizeConnectionDataIntoSections(allFields)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-900 bg-red-100 border-r border-gray-200 w-80">
              TRUST DETAILS
            </th>
            {people.map((personEmail) => (
              <th
                key={personEmail}
                className="px-4 py-3 text-center font-semibold text-gray-900 border-r border-gray-200 min-w-48"
              >
                <div className="text-xs text-gray-600 mb-1">SHARED BY</div>
                <div className="text-sm font-medium">{personEmail}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(organizedData).map(([sectionName, sectionFields]) => (
            <ConnectionSection
              key={sectionName}
              title={sectionName}
              fields={sectionFields}
              people={people}
              connectionsData={connectionsData}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
