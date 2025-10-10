import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"

interface DocumentStatusCardProps {
  documentKey: string
  status: "verified" | "pending" | "not_verified"
}

const getStatusConfig = (status: "verified" | "pending" | "not_verified") => {
  switch (status) {
    case "verified":
      return {
        bgColor: "bg-green-50 border-green-200",
        iconColor: "text-green-600",
        icon: CheckCircle,
        description: "Document successfully verified",
        badge: "VERIFIED",
        badgeColor: "bg-green-100 text-green-800 border-green-200",
      }
    case "pending":
      return {
        bgColor: "bg-orange-50 border-orange-200",
        iconColor: "text-orange-600",
        icon: Clock,
        description: "Verification in progress",
        badge: "PENDING",
        badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      }
    case "not_verified":
    default:
      return {
        bgColor: "bg-gray-50 border-gray-200",
        iconColor: "text-gray-500",
        icon: Clock,
        description: "Verification not started",
        badge: "NOT VERIFIED",
        badgeColor: "bg-gray-100 text-gray-600 border-gray-200",
      }
  }
}

const formatDocumentName = (key: string): string => {
  const nameMap: { [key: string]: string } = {
    pan_card: "PAN CARD",
    aadhaar_card: "AADHAAR CARD",
    passport: "PASSPORT",
    driving_license: "DRIVING LICENSE",
    voter_id: "VOTER ID",
    birth_certificate: "BIRTH CERTIFICATE",
    marriage_certificate: "MARRIAGE CERTIFICATE",
    income_certificate: "INCOME CERTIFICATE",
    caste_certificate: "CASTE CERTIFICATE",
    domicile_certificate: "DOMICILE CERTIFICATE",
  }

  return (
    nameMap[key] ||
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .toUpperCase()
  )
}

export default function DocumentStatusCard({ documentKey, status }: DocumentStatusCardProps) {
  const config = getStatusConfig(status)
  const IconComponent = config.icon
  const documentName = formatDocumentName(documentKey)

  return (
    <Card className={`${config.bgColor} border transition-all duration-200 hover:shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{documentName}</h3>
              <p className="text-xs text-gray-600 mt-0.5">{config.description}</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <Badge className={`text-xs font-medium px-2 py-1 ${config.badgeColor}`}>{config.badge}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
