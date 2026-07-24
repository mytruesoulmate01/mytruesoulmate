import { createBrowserClient } from '@supabase/ssr'
import { supabaseConfig } from './config'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client
  
  client = createBrowserClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
  )
  
  return client
}
