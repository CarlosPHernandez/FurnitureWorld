import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Hardcoded values as fallback (only use in development)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xymquhylknnrzubnolup.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bXF1aHlsa25ucnp1Ym5vbHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTgzMjYsImV4cCI6MjA1NTEzNDMyNn0.45hUbJYyO1f6DvSlEmAFMWimvvXJMg-7JNfTRv7Io94'

    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' ||
      !supabaseKey || supabaseKey === 'your_supabase_anon_key') {
      console.error('Missing Supabase environment variables in middleware')
      return res
    }

    // Create the middleware client
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/',
    '/customer-report',
    '/courier-payroll',
    '/delivery-data',
    '/app-integration',
    '/delivery-logs-dropdown',
    '/download-report',
    '/customize-widget',
    '/search-bar/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/couriers/:path*',
    '/deliveries/:path*',
  ],
} 