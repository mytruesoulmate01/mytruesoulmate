import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseConfig } from './config'

/**
 * Creates a Supabase client for server-side operations.
 * Always create a new client within each function - don't store in global variables.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          const isProd = process.env.NODE_ENV === 'production'
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                secure: isProd,
                sameSite: 'lax',
              }),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    },
  )
}
