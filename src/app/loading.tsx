import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
      <div className="flex items-center space-x-2 text-[#2D6BFF]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  )
} 