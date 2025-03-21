import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
    supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Not set',
    supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Not set',
    fallbackKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
  })
} 