"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FormMessage } from "@/components/ui/form-message"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"
import Link from "next/link"
import { ArrowLeft, Shield, CheckCircle, Eye, EyeOff, Lock } from "lucide-react"
import { ResetPasswordDebugHelper } from "./debug-helper"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showDebug, setShowDebug] = useState(true) // Enable debug by default

  // Validate token on component mount
  useEffect(() => {
    console.log("🔵 [ResetPasswordPage] Component mounted with token:", token ? `${token.substring(0, 10)}...` : "none")

    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token")
        setIsValidating(false)
        return
      }

      try {
        console.log("🔵 [ResetPasswordPage] Validating token:", token.substring(0, 10) + "...")

        const response = await fetch("/api/auth/reset-password/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()
        console.log("🔵 [ResetPasswordPage] Token validation response:", data)

        if (data.valid) {
          setIsTokenValid(true)
          console.log("✅ [ResetPasswordPage] Token is valid")
        } else {
          setError(data.error || "Invalid or expired reset token")
          console.log("❌ [ResetPasswordPage] Token is invalid:", data.error)
        }
      } catch (error) {
        console.error("❌ [ResetPasswordPage] Token validation error:", error)
        setError("Network error. Please check your connection and try again.")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      console.log("🔵 [ResetPasswordPage] Submitting password reset")
      console.log("🔵 [ResetPasswordPage] Request payload:", {
        hasToken: !!token,
        hasPassword: !!password,
        hasConfirmPassword: !!confirmPassword,
        tokenLength: token?.length,
        passwordLength: password.length,
        confirmPasswordLength: confirmPassword.length,
      })

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      const data = await response.json()
      console.log("🔵 [ResetPasswordPage] Password reset response:", data)

      if (data.success) {
        setMessage(data.message)
        setIsCompleted(true)
        console.log("✅ [ResetPasswordPage] Password reset successful")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        console.log("❌ [ResetPasswordPage] Password reset failed:", data.error)
        setError(data.error || "An error occurred. Please try again.")
        if (data.issues) {
          setError(`${data.error}: ${data.issues.join(", ")}`)
        }
      }
    } catch (error) {
      console.error("❌ [ResetPasswordPage] Password reset error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle debug panel
  const toggleDebug = () => {
    setShowDebug(!showDebug)
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner className="w-8 h-8 mb-4" />
            <p className="text-gray-600">Validating reset token...</p>
            {showDebug && <ResetPasswordDebugHelper />}
            <button onClick={toggleDebug} className="mt-4 text-xs text-gray-500 hover:text-gray-700">
              {showDebug ? "Hide Debug Info" : "Show Debug Info"}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Password Reset Successful</CardTitle>
            <CardDescription className="text-gray-600">Your password has been updated successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">What's next?</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• You can now log in with your new password</li>
                <li>• Consider enabling two-factor authentication</li>
                <li>• Keep your password secure and don't share it</li>
                <li>• You'll be redirected to login in a few seconds</li>
              </ul>
            </div>

            <Link href="/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>

            {showDebug && <ResetPasswordDebugHelper />}
            <button onClick={toggleDebug} className="mt-4 text-xs text-gray-500 hover:text-gray-700">
              {showDebug ? "Hide Debug Info" : "Show Debug Info"}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Invalid Reset Link</CardTitle>
            <CardDescription className="text-gray-600">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormMessage type="error" message={error} />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Need help?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Password reset links expire after 30 minutes</li>
                <li>• Each link can only be used once</li>
                <li>• Request a new password reset if needed</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>

            {showDebug && <ResetPasswordDebugHelper />}
            <button onClick={toggleDebug} className="mt-4 text-xs text-gray-500 hover:text-gray-700">
              {showDebug ? "Hide Debug Info" : "Show Debug Info"}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create New Password</CardTitle>
          <CardDescription className="text-gray-600">Enter a strong password to secure your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {error && <FormMessage type="error" message={error} />}

            <Button
              type="submit"
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Password Requirements</h3>
                  <ul className="text-amber-800 text-xs mt-1 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                    <li>• Include at least one special character</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Login
            </Link>
          </div>

          {showDebug && <ResetPasswordDebugHelper />}
          <button onClick={toggleDebug} className="mt-4 text-xs text-gray-500 hover:text-gray-700 block mx-auto">
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner className="w-8 h-8 mb-4" />
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
