"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  role?: string // Add optional role field
  trustScore?: number
  tokenExpiry?: number
  dateOfBirth?: string
  gender?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; remainingMinutes?: number }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleSessionInvalidation = (error?: string) => {
    if (error === "Session invalidated" || error === "Invalid or expired token") {
      setUser(null)
      // Show user-friendly notification about session invalidation
      if (typeof window !== "undefined") {
        // You can replace this with your preferred notification system
        console.log("Your session has been invalidated for security reasons. Please log in again.")
      }
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setUser({
            ...data.user,
            role: data.user.role || "user", // Ensure role is included with fallback
          })
        } else {
          setUser(null)
        }
      } else {
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}))
          handleSessionInvalidation(errorData.error)
        }
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; remainingMinutes?: number }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Set user data from login response including role
        if (data.user) {
          setUser({
            id: data.user.id.toString(),
            email: data.user.email,
            role: data.user.role || "user", // Include role with fallback
            trustScore: data.user.trustScore || 0,
            dateOfBirth: data.user.dateOfBirth,
            gender: data.user.gender,
          })
        } else {
          await checkAuth() // Fallback to verify endpoint
        }
        return { success: true }
      } else {
        if (response.status === 423 && data.error === "ACCOUNT_LOCKED") {
          return {
            success: false,
            error: data.message || "Account is temporarily locked",
            remainingMinutes: data.remainingMinutes,
          }
        }
        return { success: false, error: data.message || data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setUser(null)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        await checkAuth()
        return true
      } else {
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}))
          handleSessionInvalidation(errorData.error)
        }
      }
      return false
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  // Auto-refresh token before expiry
  useEffect(() => {
    if (user?.tokenExpiry) {
      const timeUntilExpiry = user.tokenExpiry * 1000 - Date.now()
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60000) // 5 minutes before expiry, minimum 1 minute

      const timer = setTimeout(() => {
        refreshToken()
      }, refreshTime)

      return () => clearTimeout(timer)
    }
  }, [user?.tokenExpiry])

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
