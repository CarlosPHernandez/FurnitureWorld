import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
  )
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storageKey: 'supabase.auth.token',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    }
  }
) 