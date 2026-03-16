"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  role?: string
  fullName?: string
  emailConfirmed?: boolean
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      role: supabaseUser.user_metadata?.role || "user",
      fullName: supabaseUser.user_metadata?.full_name || null,
      emailConfirmed: !!supabaseUser.email_confirmed_at,
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error("[Auth] Error fetching user:", error.message)
        setUser(null)
        setSupabaseUser(null)
        return
      }

      setSupabaseUser(currentUser)
      setUser(mapSupabaseUser(currentUser))
    } catch (error) {
      console.error("[Auth] Unexpected error:", error)
      setUser(null)
      setSupabaseUser(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
    } catch (error) {
      console.error("[Auth] Sign out error:", error)
    }
  }

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("[Auth] Initial auth check error:", error.message)
        }
        
        setSupabaseUser(currentUser)
        setUser(mapSupabaseUser(currentUser))
      } catch (error) {
        console.error("[Auth] Unexpected error during init:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] Auth state changed:", event)
        
        if (session?.user) {
          setSupabaseUser(session.user)
          setUser(mapSupabaseUser(session.user))
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, supabaseUser, isLoading, signOut, refreshUser }}>
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
