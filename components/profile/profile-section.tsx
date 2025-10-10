import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileSectionProps {
  title: string
  icon?: string
  data: Record<string, any>
  isTrusted: (value: any) => boolean
}

export function ProfileSection({ title, icon, data, isTrusted }: ProfileSectionProps) {
  const hasData = Object.keys(data).length > 0

  if (!hasData) return null

  return (
    <Card className="shadow-lg border-0 bg-white overflow-hidden mb-4">
      <CardHeader className="bg-red-600 text-white py-4 px-6">
        <CardTitle className="text-base font-bold flex items-center gap-3 uppercase tracking-wide">
          {icon && <span className="text-lg">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="py-2 px-4 text-left font-bold text-sm uppercase tracking-wide border-r border-red-500">
                  TRUST-DETAILS
                </th>
                <th className="py-2 px-4 text-left font-bold text-sm uppercase tracking-wide">TRUST-VALUE</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([key, value], index) => {
                const trusted = isTrusted(value)
                const isEven = index % 2 === 0

                return (
                  <tr key={key} className={isEven ? "bg-gray-100" : "bg-white"}>
                    <td className="py-3 px-4 font-medium uppercase text-gray-800 text-sm border-r border-gray-200">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        trusted ? "text-gray-900 font-medium" : "text-red-600 font-medium italic"
                      }`}
                    >
                      {trusted ? String(value) : "Not Available"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
