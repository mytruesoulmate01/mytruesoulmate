import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TrustScoreSectionProps {
  title: string
  icon?: string
  data: Record<string, any>
  isTrusted: (value: any) => boolean
}

export function TrustScoreSection({ title, icon, data, isTrusted }: TrustScoreSectionProps) {
  // Always show the section - Trust Score displays all fields with check/X status

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
                <th className="py-2 px-4 text-left font-bold text-sm uppercase tracking-wide">TRUST-STATUS</th>
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
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg ${trusted ? "text-green-600" : "text-red-600"}`}>
                        {trusted ? "✅" : "❌"}
                      </span>
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
