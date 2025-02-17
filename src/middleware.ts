import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = [
  '/delivery-dashboard',
  '/customer-report',
  '/courier-payroll',
  '/delivery-data',
  '/delivery-invoices',
  '/delivery-logs',
  '/download-report',
  '/customize-widget',
  '/search',
]

export async function middleware(request: NextRequest) {
  // Always return next response to allow access to all routes
  return NextResponse.next()
}

// Keep the matcher configuration for reference
export const config = {
  matcher: [
    '/',
    '/delivery-dashboard',
    '/customer-report',
    '/courier-payroll',
    '/delivery-data',
    '/delivery-invoices',
    '/delivery-logs-dropdown',
    '/download-report',
    '/customize-widget',
    '/search-bar/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/couriers/:path*',
    '/deliveries/:path*',
    '/auth/:path*'
  ]
} 