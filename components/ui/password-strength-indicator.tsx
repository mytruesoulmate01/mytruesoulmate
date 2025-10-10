"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
}

interface PasswordValidation {
  score: number
  isValid: boolean
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSpecialChars: boolean
  issues: string[]
}

function validatePasswordStrength(password: string): PasswordValidation {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const issues: string[] = []
  if (!hasMinLength) issues.push("At least 8 characters")
  if (!hasUppercase) issues.push("One uppercase letter")
  if (!hasLowercase) issues.push("One lowercase letter")
  if (!hasNumbers) issues.push("One number")
  if (!hasSpecialChars) issues.push("One special character")

  let score = 0
  if (hasMinLength) score += 20
  if (hasUppercase) score += 20
  if (hasLowercase) score += 20
  if (hasNumbers) score += 20
  if (hasSpecialChars) score += 20

  // Bonus points for length
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars

  return {
    score: Math.min(score, 100),
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialChars,
    issues,
  }
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => validatePasswordStrength(password), [password])

  const getStrengthLabel = (score: number) => {
    if (score < 40) return { label: "Weak", color: "text-red-600" }
    if (score < 60) return { label: "Fair", color: "text-orange-600" }
    if (score < 80) return { label: "Good", color: "text-yellow-600" }
    if (score < 100) return { label: "Strong", color: "text-green-600" }
    return { label: "Excellent", color: "text-green-700" }
  }

  const getProgressColor = (score: number) => {
    if (score < 40) return "bg-red-500"
    if (score < 60) return "bg-orange-500"
    if (score < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const strength = getStrengthLabel(validation.score)

  if (!password) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
      </div>

      <Progress
        value={validation.score}
        className="h-2"
        style={{
          background: "#e5e7eb",
        }}
      />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          {validation.hasMinLength ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
          <span className={validation.hasMinLength ? "text-green-700" : "text-red-600"}>8+ characters</span>
        </div>

        <div className="flex items-center space-x-1">
          {validation.hasUppercase ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
          <span className={validation.hasUppercase ? "text-green-700" : "text-red-600"}>Uppercase</span>
        </div>

        <div className="flex items-center space-x-1">
          {validation.hasLowercase ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
          <span className={validation.hasLowercase ? "text-green-700" : "text-red-600"}>Lowercase</span>
        </div>

        <div className="flex items-center space-x-1">
          {validation.hasNumbers ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
          <span className={validation.hasNumbers ? "text-green-700" : "text-red-600"}>Number</span>
        </div>

        <div className="flex items-center space-x-1 col-span-2">
          {validation.hasSpecialChars ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
          <span className={validation.hasSpecialChars ? "text-green-700" : "text-red-600"}>
            Special character (!@#$%^&*)
          </span>
        </div>
      </div>
    </div>
  )
}
