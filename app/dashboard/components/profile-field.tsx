import type { LucideIcon } from "lucide-react"

interface ProfileFieldProps {
  icon: LucideIcon
  label: string
  value: string
  className?: string
}

export default function ProfileField({ icon: Icon, label, value, className = "" }: ProfileFieldProps) {
  return (
    <div className={`flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-md ${className}`}>
      <div className="flex-shrink-0 mt-1">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30">
          <Icon className="h-4 w-4 text-red-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  )
}
