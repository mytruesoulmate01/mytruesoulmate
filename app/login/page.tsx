"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockoutInfo, setLockoutInfo] = useState<{ remainingMinutes?: number } | null>(null)
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const registered = searchParams.get("registered") === "true"
  const verified = searchParams.get("verified") === "true"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) {
      setError(null)
      setLockoutInfo(null)
      setIsEmailNotVerified(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setLockoutInfo(null)
    setIsEmailNotVerified(false)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        router.push("/dashboard/profile")
      } else {
        if (result.remainingMinutes !== undefined) {
          setLockoutInfo({ remainingMinutes: result.remainingMinutes })
        }
        if (result.error?.includes("verify your email") || result.error?.includes("EMAIL_NOT_VERIFIED")) {
          setIsEmailNotVerified(true)
        }
        setError(result.error || "Invalid email or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
              <Image
                src="/images/clean-heart-logo.png"
                alt="TrueSoulMate Heart Logo"
                width={24}
                height={24}
                priority
                className="filter brightness-0 invert"
              />
            </div>
            <span className="text-2xl font-bold">MyTrueSoulMate</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access your account</p>
        </div>

        {verified && (
          <div className="p-4 rounded-md text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
            <div className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Email verified successfully!</p>
                <p className="mt-1 text-xs">You can now log in to your account.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className={`p-4 rounded-md text-sm ${
              lockoutInfo
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-600"
            }`}
          >
            <div className="flex items-start">
              {lockoutInfo ? (
                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{error}</p>
                {lockoutInfo && lockoutInfo.remainingMinutes && (
                  <div className="mt-2 text-xs">
                    <p>For security reasons, your account has been temporarily locked.</p>
                    <p className="mt-1">
                      <strong>Time remaining: {lockoutInfo.remainingMinutes} minutes</strong>
                    </p>
                    <p className="mt-2">If you believe this is an error, please contact support or try again later.</p>
                  </div>
                )}
                {isEmailNotVerified && (
                  <div className="mt-2">
                    <Link href="/resend-verification" className="text-xs underline hover:no-underline">
                      Resend verification email
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-red-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full pr-10"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isSubmitting || (lockoutInfo && lockoutInfo.remainingMinutes && lockoutInfo.remainingMinutes > 0)}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-red-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
