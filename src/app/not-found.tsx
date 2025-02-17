'use client'

import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 text-[#FF9500] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg mx-auto w-fit"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
} 