import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client - SERVER-SIDE ONLY
 * 
 * This client uses the service role key which bypasses Row Level Security (RLS).
 * NEVER import this file in client-side code or expose the service role key.
 * 
 * Use cases:
 * - Admin operations that need to bypass RLS
 * - Server Actions requiring privileged database access
 * - API routes handling webhooks or background jobs
 * - Operations on behalf of users (e.g., account deletion)
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
