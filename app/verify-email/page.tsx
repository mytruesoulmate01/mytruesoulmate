"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email and try again.")
      return
    }

    // Call the verification API
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.alreadyVerified) {
          setStatus("success")
          setMessage(data.message || "Email verified successfully!")
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.message || "Verification failed. Please try again.")
        }
      })
      .catch((error) => {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage("An error occurred during verification. Please try again.")
      })
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-white" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 text-white" />}
            {status === "error" && <XCircle className="h-8 w-8 text-white" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="text-center text-sm text-muted-foreground">Redirecting to login page in 3 seconds...</div>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
              <Button onClick={() => router.push("/resend-verification")} variant="outline" className="w-full">
                Resend Verification Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
