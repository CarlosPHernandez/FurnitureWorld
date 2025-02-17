'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Database,
  FileText,
  Settings,
  Receipt,
  ClipboardList,
  Download,
  Palette,
  Search,
  MapPin,
  Package,
  FileSearch,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/delivery-dashboard', icon: LayoutDashboard },
  { name: 'Route Planning', href: '/route-planning', icon: MapPin },
  { name: 'Deliveries', href: '/deliveries', icon: Package },
  { name: 'Invoice Scanner', href: '/invoice-scanner', icon: FileSearch },
  { name: 'Customer Report', href: '/customer-report', icon: Users },
  { name: 'Delivery Data', href: '/delivery-data', icon: Database },
  { name: 'Delivery Invoices', href: '/delivery-invoices', icon: Receipt },
  { name: 'Search', href: '/search', icon: Search },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E5E5E5] p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Delivery Manager</h1>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#2D6BFF] text-white'
                        : 'text-[#1A1A1A] hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
} 