'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

// Function to create a Supabase client
export function createClient() {
  // Hardcoded values as fallback (only use in development)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xymquhylknnrzubnolup.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bXF1aHlsa25ucnp1Ym5vbHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTgzMjYsImV4cCI6MjA1NTEzNDMyNn0.45hUbJYyO1f6DvSlEmAFMWimvvXJMg-7JNfTRv7Io94'

  if (typeof window !== 'undefined') {
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
      console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
  }

  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey,
  })
}

// For backward compatibility
export const supabase = createClient() 