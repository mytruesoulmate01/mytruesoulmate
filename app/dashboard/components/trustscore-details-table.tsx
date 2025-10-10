import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface TrustScoreItem {
  key: string
  displayName: string
  status: "verified" | "not_verified" | "pending"
  score: number
}

interface TrustScoreDetailsTableProps {
  items: TrustScoreItem[]
  isLoading?: boolean
}

export default function TrustScoreDetailsTable({ items, isLoading }: TrustScoreDetailsTableProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    VERIFICATION-DETAILS
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    VERIFICATION-STATUS
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    TRUSCORE
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-6 w-20 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-6 w-6 bg-gray-200 rounded mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-gray-500">No trust score data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "verified":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          text: "VERIFIED",
          textColor: "text-green-600",
          score: 1,
          scoreColor: "text-green-600",
        }
      case "pending":
        return {
          icon: <CheckCircle className="h-4 w-4 text-amber-600" />,
          text: "PENDING",
          textColor: "text-amber-600",
          score: 0,
          scoreColor: "text-amber-600",
        }
      case "not_verified":
      default:
        return {
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          text: "NOT VERIFIED",
          textColor: "text-red-600",
          score: 0,
          scoreColor: "text-red-600",
        }
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  VERIFICATION-DETAILS
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  VERIFICATION-STATUS
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  TRUSCORE
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const statusConfig = getStatusDisplay(item.status)
                return (
                  <tr key={item.key} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    {/* Verification Details Column */}
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900 uppercase">{item.displayName}</span>
                    </td>

                    {/* Verification Status Column */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {statusConfig.icon}
                        <span className={`text-sm font-medium ${statusConfig.textColor}`}>{statusConfig.text}</span>
                      </div>
                    </td>

                    {/* Trust Score Column */}
                    <td className="py-4 px-6 text-center">
                      <span className={`text-lg font-bold ${statusConfig.scoreColor}`}>{statusConfig.score}</span>
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
