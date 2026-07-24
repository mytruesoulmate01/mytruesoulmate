/**
 * Supabase Configuration
 * 
 * Switches between Production and Test databases based on NEXT_PUBLIC_TEST_MODE
 * 
 * Environment Variables Required:
 * - Production: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 * - Test: NEXT_PUBLIC_TEST_SUPABASE_URL, NEXT_PUBLIC_TEST_SUPABASE_ANON_KEY, NEXT_SUPABASE_SERVICE_TEST_ROLE_KEY
 * - Switch: NEXT_PUBLIC_TEST_MODE ('true' for test, 'false' for production)
 */

const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

export const supabaseConfig = {
  url: isTestMode
    ? process.env.NEXT_PUBLIC_TEST_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_SUPABASE_URL!,

  anonKey: isTestMode
    ? process.env.NEXT_PUBLIC_TEST_SUPABASE_ANON_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

  serviceRoleKey: isTestMode
    ? process.env.NEXT_SUPABASE_SERVICE_TEST_ROLE_KEY!
    : process.env.SUPABASE_SERVICE_ROLE_KEY!,

  isTestMode,
}

// Validation - only run on server side
if (typeof window === 'undefined') {
  if (!supabaseConfig.url) {
    throw new Error(
      isTestMode
        ? 'Missing env.NEXT_PUBLIC_TEST_SUPABASE_URL'
        : 'Missing env.NEXT_PUBLIC_SUPABASE_URL'
    )
  }

  if (!supabaseConfig.anonKey) {
    throw new Error(
      isTestMode
        ? 'Missing env.NEXT_PUBLIC_TEST_SUPABASE_ANON_KEY'
        : 'Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
}
