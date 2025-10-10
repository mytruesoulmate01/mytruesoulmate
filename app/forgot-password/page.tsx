"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FormMessage } from "@/components/ui/form-message"
import Link from "next/link"
import { ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react"
import { ForgotPasswordDebugHelper } from "@/components/forgot-password-debug-helper" // Declare the variable before using it

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showDebug, setShowDebug] = useState(false) // Enable debug by default

  // Get URL parameters
  const urlMessage = searchParams.get("message")
  const urlError = searchParams.get("error")

  console.log("🔵 [ForgotPasswordPage] Component rendered", {
    urlMessage,
    urlError,
    timestamp: new Date().toISOString(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      console.log("🔵 [ForgotPasswordPage] Submitting forgot password request", {
        email: email.split("@")[1], // Only log domain for privacy
        timestamp: new Date().toISOString(),
      })

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("🔵 [ForgotPasswordPage] Forgot password response:", data)

      if (data.success) {
        setMessage(data.message)
        setIsSubmitted(true)
        console.log("✅ [ForgotPasswordPage] Forgot password request successful")
      } else {
        console.log("❌ [ForgotPasswordPage] Forgot password request failed:", data.error)
        setError(data.error || "An error occurred. Please try again.")
      }
    } catch (error) {
      console.error("❌ [ForgotPasswordPage] Forgot password error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle debug panel
  const toggleDebug = () => {
    setShowDebug(!showDebug)
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent password reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormMessage type="success" message={message} />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What's next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reset link within 30 minutes</li>
                <li>• Create a new strong password</li>
                <li>• Log in with your new password</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                  setMessage("")
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>

            {showDebug && <ForgotPasswordDebugHelper />}
            <button onClick={toggleDebug} className="mt-4 text-xs text-gray-500 hover:text-gray-700 block mx-auto">
              {showDebug ? "Hide Debug Info" : "Show Debug Info"}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main forgot password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {(error || urlError) && <FormMessage type="error" message={error || urlError || ""} />}
            {(message || urlMessage) && <FormMessage type="success" message={message || urlMessage || ""} />}

            <Button type="submit" disabled={isLoading || !email} className="w-full">
              {isLoading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Important Info</h3>
                  <p className="text-amber-800 text-xs mt-1">
                    Reset links expire after 30 minutes for your security. If you don't receive an email, check your
                    spam folder or try again.
                  </p>
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

          {showDebug && <ForgotPasswordDebugHelper />}
          <button onClick={toggleDebug} className="mt-4 text-xs text-gray-500 hover:text-gray-700 block mx-auto">
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordForm />
    </Suspense>
  )
}
