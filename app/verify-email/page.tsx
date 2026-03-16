"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"checking" | "verified" | "pending">("checking")
  const email = searchParams.get("email") || ""

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email_confirmed_at) {
        setStatus("verified")
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setStatus("pending")
      }
    }

    checkVerification()
  }, [router])

  const handleResendEmail = async () => {
    if (!email) return
    
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (!error) {
      alert("Verification email sent! Please check your inbox.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500">
            {status === "checking" && <Loader2 className="h-8 w-8 animate-spin text-white" />}
            {status === "verified" && <CheckCircle2 className="h-8 w-8 text-white" />}
            {status === "pending" && <Mail className="h-8 w-8 text-white" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "checking" && "Checking Verification..."}
            {status === "verified" && "Email Verified!"}
            {status === "pending" && "Check Your Email"}
          </CardTitle>
          <CardDescription>
            {status === "checking" && "Please wait while we check your verification status."}
            {status === "verified" && "Your email has been verified. Redirecting to dashboard..."}
            {status === "pending" && (
              <>
                We sent a verification link to <strong>{email || "your email"}</strong>.
                <br />
                Click the link in your email to verify your account.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "pending" && (
            <>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                <p className="font-medium">Did not receive the email?</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>

              {email && (
                <Button 
                  onClick={handleResendEmail} 
                  variant="outline" 
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
              )}

              <Button 
                onClick={() => router.push("/login")} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Back to Login
              </Button>
            </>
          )}

          {status === "verified" && (
            <div className="text-center text-sm text-muted-foreground">
              Redirecting to dashboard...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
