"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VerificationStatusCardProps {
  stats: {
    total: number
    verified: number
    pending: number
    percentage: number
  }
  onRefresh: () => void
  isLoading?: boolean
}

export default function VerificationStatusCard({ stats, onRefresh, isLoading = false }: VerificationStatusCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Verification Status</h3>
            <p className="text-sm text-gray-600">
              {stats.verified} of {stats.total} documents verified • {stats.pending} pending
            </p>
          </div>
          <Badge
            className={`text-xs font-medium px-2 py-1 ${
              stats.percentage === 100
                ? "bg-green-100 text-green-800 border-green-200"
                : stats.percentage > 0
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {stats.percentage}% Complete
          </Badge>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              stats.percentage === 100
                ? "bg-green-500"
                : stats.percentage > 0
                  ? "bg-gradient-to-r from-blue-500 to-green-500"
                  : "bg-gray-300"
            }`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>
            {stats.verified}/{stats.total} verified
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
