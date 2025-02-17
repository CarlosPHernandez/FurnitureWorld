'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Application Error</h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={reset}
              className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg mx-auto"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
} 