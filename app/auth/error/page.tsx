"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, { title: string; description: string }> = {
    auth_callback_error: {
      title: "Authentication Failed",
      description: "We couldn't complete the authentication process. This might be due to an expired or invalid link.",
    },
    verification_failed: {
      title: "Verification Failed",
      description: "We couldn't verify your request. The link may have expired or already been used.",
    },
    access_denied: {
      title: "Access Denied",
      description: "You don't have permission to access this resource.",
    },
    expired_link: {
      title: "Link Expired",
      description: "This link has expired. Please request a new one.",
    },
    default: {
      title: "Something went wrong",
      description: "An unexpected error occurred during authentication.",
    },
  }

  const errorInfo = errorMessages[error || "default"] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{errorInfo.title}</CardTitle>
          <CardDescription className="text-gray-600">{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 text-sm mb-2">What you can try:</h3>
            <ul className="text-amber-800 text-sm space-y-1">
              <li>• Request a new verification or reset link</li>
              <li>• Make sure you're using the most recent link</li>
              <li>• Check if the link was copied completely</li>
              <li>• Try signing in again</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Create New Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
