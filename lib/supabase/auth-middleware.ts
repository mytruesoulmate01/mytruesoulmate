import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "./server"
import type { User } from "@supabase/supabase-js"

export interface SupabaseUser {
  id: string
  email: string
  role?: string
  emailConfirmed?: boolean
}

/**
 * Get the current authenticated user from Supabase
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{
  isAuthenticated: boolean
  user?: SupabaseUser
  supabaseUser?: User
  response?: NextResponse
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("[Auth] No authenticated user found")
      return {
        isAuthenticated: false,
        response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
      }
    }

    const mappedUser: SupabaseUser = {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "user",
      emailConfirmed: !!user.email_confirmed_at,
    }

    console.log("[Auth] Authenticated user:", { id: user.id, email: user.email })

    return {
      isAuthenticated: true,
      user: mappedUser,
      supabaseUser: user,
    }
  } catch (error) {
    console.error("[Auth] Error getting authenticated user:", error)
    return {
      isAuthenticated: false,
      response: NextResponse.json({ error: "Authentication failed" }, { status: 500 }),
    }
  }
}

/**
 * Create protected route handler using Supabase auth
 */
export function withSupabaseAuth(
  handler: (request: NextRequest, user: SupabaseUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await getAuthenticatedUser(request)

    if (!authResult.isAuthenticated || !authResult.user) {
      return authResult.response!
    }

    return handler(request, authResult.user)
  }
}

/**
 * Get the current user from an API route (without requiring full auth result)
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "user",
      emailConfirmed: !!user.email_confirmed_at,
    }
  } catch {
    return null
  }
}
