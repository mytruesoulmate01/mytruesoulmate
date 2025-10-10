interface TrustScoreBadgeProps {
  trustScore?: boolean
}

export function TrustScoreBadge({ trustScore }: TrustScoreBadgeProps) {
  if (trustScore === undefined) return null

  return (
    <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
      <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
        Overall Trustscore:{" "}
        <span className={trustScore ? "text-green-600 text-3xl" : "text-red-500 text-3xl"}>
          {trustScore ? "✅" : "❌"}
        </span>
      </div>
    </div>
  )
}
