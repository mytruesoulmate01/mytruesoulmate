import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormMessageProps {
  type: "error" | "success" | "info" | "warning"
  message: string
  className?: string
}

export function FormMessage({ type, message, className }: FormMessageProps) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const iconStyles = {
    error: "text-red-500",
    success: "text-green-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  }

  const Icon = icons[type]

  return (
    <div className={cn("flex items-start space-x-2 p-3 rounded-lg border", styles[type], className)}>
      <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconStyles[type])} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
