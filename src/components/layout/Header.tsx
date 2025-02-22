'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ChevronDown,
  Download,
  Settings2,
  Command,
  LogOut,
  User,
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface HeaderProps {
  title?: string
}

interface UserMetadata {
  name?: string;
  avatar_url?: string;
  [key: string]: string | undefined;
}

interface UserData {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
}

export default function Header({ title }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  return (
    <header className="fixed top-0 left-60 right-0 h-[60px] bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between z-10">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search deliveries..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-gray-400">
            <Command className="h-3 w-3 mr-1" />
            <span>F</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
          <span>Delivery Logs</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </button>
        
        <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
          <Download className="mr-2 h-4 w-4" />
          <span>Download Report</span>
        </button>
        
        <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
          <Settings2 className="mr-2 h-4 w-4" />
          <span>Customize Widget</span>
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg"
            >
              <User className="mr-2 h-4 w-4" />
              <span className="max-w-[150px] truncate">{user.email}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push('/auth/signin')}
            className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
          >
            <User className="mr-2 h-4 w-4" />
            Sign in
          </button>
        )}
      </div>
    </header>
  )
} 