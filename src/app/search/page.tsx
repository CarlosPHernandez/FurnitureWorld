'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  Search,
  Filter,
  Clock,
  Package,
  MapPin,
  ChevronRight,
  ChevronDown,
  X,
  LucideIcon,
} from 'lucide-react'
import Image from 'next/image'

const recentSearches = [
  'Order #1234',
  'John Smith delivery',
  'Late deliveries',
  'Express orders'
]

type SearchResult = {
  type: 'order' | 'courier' | 'location'
  id: string
  title: string
  status: string
  time: string
  address: string
  icon?: LucideIcon
  avatar?: string
}

const searchResults: SearchResult[] = [
  {
    type: 'order',
    id: 'ORD-1234',
    title: 'Delivery to John Smith',
    status: 'In Transit',
    time: '10 minutes ago',
    address: '123 Main St, New York, NY',
    icon: Package
  },
  {
    type: 'courier',
    id: 'COU-789',
    title: 'Mike Johnson',
    status: 'Active',
    time: '2 deliveries in progress',
    address: 'Currently at: Downtown',
    avatar: 'https://picsum.photos/seed/1/32/32'
  },
  {
    type: 'location',
    id: 'LOC-456',
    title: 'Tech Hub Office',
    status: 'Frequent',
    time: '25 deliveries this month',
    address: '456 Business Ave, NY',
    icon: MapPin
  }
]

const filters = [
  {
    name: 'Type',
    options: ['All', 'Orders', 'Couriers', 'Locations']
  },
  {
    name: 'Status',
    options: ['All', 'Active', 'Completed', 'In Transit']
  },
  {
    name: 'Date',
    options: ['Any time', 'Today', 'This week', 'This month']
  }
]

export default function SearchPage() {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Search</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Global Search</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for orders, couriers, locations..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-sm text-gray-400">
                <span className="mr-2">⌘</span>
                <span>/</span>
              </div>
            </div>

            {/* Recent Searches */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-sm text-gray-600 hover:bg-gray-200"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {search}
                    <X className="h-3.5 w-3.5 ml-1.5 hover:text-gray-800" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Filters</h2>
            <button className="text-sm text-[#2D6BFF] hover:underline">
              Reset All
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
            {filters.map((filter) => (
              <div key={filter.name}>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  {filter.name}
                </label>
                <div className="relative">
                  <select className="appearance-none w-48 px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent text-sm">
                    {filter.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Search Results
          </h2>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                {result.type === 'courier' && result.avatar ? (
                  <Image
                    src={result.avatar}
                    alt={result.title}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : result.icon ? (
                  <result.icon className="h-10 w-10 text-[#2D6BFF]" />
                ) : null}
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-[#1A1A1A]">{result.title}</h3>
                      <p className="text-sm text-gray-500">{result.id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.status === 'Active' || result.status === 'In Transit'
                        ? 'bg-[#00C48C]/10 text-[#00C48C]'
                        : result.status === 'Frequent'
                        ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm">
                    <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
                    <span className="text-gray-500">{result.time}</span>
                  </div>
                  <div className="mt-1 flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1.5" />
                    <span className="text-gray-500">{result.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 