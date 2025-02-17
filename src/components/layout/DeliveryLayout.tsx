'use client'

import Sidebar from './Sidebar'
import Header from './Header'

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Sidebar />
      <Header />
      <main className="pl-60 pt-[60px] min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 