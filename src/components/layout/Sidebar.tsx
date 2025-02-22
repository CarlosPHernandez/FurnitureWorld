'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Receipt,
  FileSearch,
  Search,
  BoxIcon,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/delivery-dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: BoxIcon },
  { name: 'Route Planning', href: '/route-planning', icon: MapPin },
  { name: 'Deliveries', href: '/deliveries', icon: Package },
  { name: 'Invoice Scanner', href: '/invoice-scanner', icon: FileSearch },
  { name: 'Delivery Invoices', href: '/delivery-invoices', icon: Receipt },
  { name: 'Search', href: '/search', icon: Search },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E5E5E5] p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8 bg-white">
          <Link href="/" className="block">
            <div className="relative w-[150px] h-[50px]">
              <Image
                src="/Logo-matters-1.webp"
                alt="Family Mattress"
                fill
                className="object-contain [filter:brightness(0)]"
                priority
              />
            </div>
          </Link>
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