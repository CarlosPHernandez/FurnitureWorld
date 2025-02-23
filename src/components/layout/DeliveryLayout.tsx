'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-sm"
      >
        <Menu className="h-6 w-6" />
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header />
      <main className="lg:pl-60 pt-[60px] min-h-screen">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 