import Link from 'next/link'
import { AlertOctagon, Home } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
        <AlertOctagon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-6">
          There was a problem with the authentication process. This might happen if the link has expired or has already been used.
        </p>
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg mx-auto w-fit"
          >
            Try signing in again
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 