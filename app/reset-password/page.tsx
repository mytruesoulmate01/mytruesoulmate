"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from "lucide-react"
import { updatePassword } from "@/app/auth/actions"
import { useAuth } from "@/contexts/auth-context"

function ResetPasswordForm() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) {
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!isPasswordValid) {
      setError("Password does not meet requirements")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const formDataObj = new FormData()
      formDataObj.append("password", formData.password)
      formDataObj.append("confirmPassword", formData.confirmPassword)

      const result = await updatePassword(formDataObj)

      if (result.success) {
        // Sign out to clear the recovery session
        // This ensures clean state when user goes to login
        try {
          await signOut()
        } catch (signOutError) {
          console.error("Sign out after reset failed:", signOutError)
          // Continue to success state even if sign out fails
        }
        
        setIsSuccess(true)
      } else {
        setError(result.error || "Failed to update password. Please try again.")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Password Updated!</CardTitle>
            <CardDescription className="text-gray-600">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                You can now log in with your new password.
              </p>
            </div>

            <Link href="/login">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Continue to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <p className={`text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
                  </p>
                  <p className={`text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasUppercase ? '✓' : '○'} One uppercase letter
                  </p>
                  <p className={`text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasLowercase ? '✓' : '○'} One lowercase letter
                  </p>
                  <p className={`text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasNumber ? '✓' : '○'} One number
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-md text-sm bg-red-50 text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !isPasswordValid} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-red-600 hover:text-red-500">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4" />
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
