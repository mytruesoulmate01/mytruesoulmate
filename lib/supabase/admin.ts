import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

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

if (!supabaseConfig.url) {
  throw new Error(
    supabaseConfig.isTestMode
      ? 'Missing env.TEST_NEXT_PUBLIC_SUPABASE_URL'
      : 'Missing env.NEXT_PUBLIC_SUPABASE_URL'
  )
}

if (!supabaseConfig.serviceRoleKey) {
  throw new Error(
    supabaseConfig.isTestMode
      ? 'Missing env.TEST_SUPABASE_SERVICE_ROLE_KEY'
      : 'Missing env.SUPABASE_SERVICE_ROLE_KEY'
  )
}

export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
