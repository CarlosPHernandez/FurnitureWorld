'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Receipt,
  Search,
  BoxIcon,
  CreditCard,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react'

const navigation = [
  { name: 'Sales Dashboard', href: '/', icon: TrendingUp },
  { name: 'Inventory', href: '/inventory', icon: BoxIcon },
  { name: 'Deliveries', href: '/deliveries', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Credit Customers', href: '/credit-management', icon: CreditCard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Search', href: '/search', icon: Search },
]

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-[#E5E5E5] transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-0`}>
        <div className="flex flex-col h-full p-4">
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
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-[#2D6BFF] text-white'
                        : 'text-[#1A1A1A] hover:bg-gray-100'
                        }`}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
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
    </>
  )
} 