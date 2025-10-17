"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const emailFromUrl = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailFromUrl)
  const [otp, setOtp] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(600) // 10 minutes in seconds
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setOtp(numericValue)
  }

  const handleVerify = async () => {
    if (!email || !otp) {
      setStatus("error")
      setMessage("Please enter both email and verification code")
      return
    }

    if (otp.length !== 6) {
      setStatus("error")
      setMessage("Verification code must be 6 digits")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

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
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining)
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      setStatus("error")
      setMessage("An error occurred during verification. Please try again.")
    }
  }

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address")
      return
    }

    setIsResending(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("idle")
        setMessage("New verification code sent! Please check your email.")
        setOtp("")
        setTimeRemaining(600) // Reset timer to 10 minutes
        setAttemptsRemaining(null)
      } else {
        setStatus("error")
        setMessage(data.message || "Failed to resend verification code")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-white" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 text-white" />}
            {status === "error" && <XCircle className="h-8 w-8 text-white" />}
            {status === "idle" && <Mail className="h-8 w-8 text-white" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "idle" && "Verify Your Email"}
          </CardTitle>
          <CardDescription>
            {status === "idle" && "Enter the 6-digit code sent to your email"}
            {status === "success" && message}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!emailFromUrl}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Code expires in: <span className="font-semibold">{formatTime(timeRemaining)}</span>
              </div>

              {attemptsRemaining !== null && (
                <div className="text-center text-sm text-orange-600">{attemptsRemaining} attempt(s) remaining</div>
              )}

              <Button onClick={handleVerify} className="w-full" disabled={otp.length !== 6}>
                Verify Email
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending || timeRemaining > 300}
                  className="text-sm"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>
                {timeRemaining > 300 && (
                  <p className="text-xs text-muted-foreground mt-1">Available in {formatTime(timeRemaining - 300)}</p>
                )}
              </div>
            </>
          )}

          {status === "success" && (
            <div className="text-center text-sm text-muted-foreground">Redirecting to login page in 3 seconds...</div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Button onClick={() => setStatus("idle")} className="w-full">
                Try Again
              </Button>
              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center text-sm text-muted-foreground">Please wait while we verify your email...</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
