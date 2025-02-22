'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  BarChart3, 
  MapPin, 
  Package, 
  Clock,
  ChevronRight,
  ChevronDown,
  Truck,
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface ActiveDelivery {
  id: string;
  customer: string;
  items: string;
  status: string;
  driver: string;
  eta: string;
  address: string;
  avatar: string;
}

const metrics = [
  { 
    title: "Today's Deliveries",
    value: '0',
    change: '+0',
    icon: Truck,
    color: '#2D6BFF'
  },
  {
    title: 'Available Drivers',
    value: '0',
    change: '+0',
    icon: Users,
    color: '#00C48C'
  },
  {
    title: 'Pending Orders',
    value: '0',
    change: '+0',
    icon: Package,
    color: '#FF9500'
  },
  {
    title: 'Delayed Deliveries',
    value: '0',
    change: '+0',
    icon: AlertCircle,
    color: '#FF3B30'
  }
]

const activeDeliveries: ActiveDelivery[] = []

const upcomingDeliveries = [
  { time: '09:00 AM', count: 0 },
  { time: '10:00 AM', count: 0 },
  { time: '11:00 AM', count: 0 },
  { time: '12:00 PM', count: 0 },
  { time: '01:00 PM', count: 0 },
  { time: '02:00 PM', count: 0 }
]

export default function DeliveryDashboard() {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Furniture Deliveries</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Today</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg">
              <Package className="mr-2 h-4 w-4" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-[#00C48C]' : 'text-[#FF9500]'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm">{metric.title}</h3>
              <p className="text-2xl font-bold mt-2" style={{ color: metric.color }}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Deliveries */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                Active Deliveries
              </h2>
              <button className="flex items-center text-sm text-[#2D6BFF] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <Image
                    src={delivery.avatar}
                    alt={delivery.driver}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-[#1A1A1A]">{delivery.customer}</h3>
                        <p className="text-sm text-gray-500 mt-1">{delivery.items}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        delivery.status === 'In Transit' 
                          ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                          : delivery.status === 'Loading'
                          ? 'bg-[#FF9500]/10 text-[#FF9500]'
                          : 'bg-[#00C48C]/10 text-[#00C48C]'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {delivery.address}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Driver: {delivery.driver}
                      </span>
                      <span className="text-[#2D6BFF]">
                        ETA: {delivery.eta}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Today's Schedule
            </h2>
            <div className="space-y-4">
              {upcomingDeliveries.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium">{slot.time}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      {slot.count} deliveries
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Live Delivery Tracking
            </h2>
            <button className="text-sm text-[#2D6BFF] hover:underline">
              Full Screen
            </button>
          </div>
          <div className="h-[400px] flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
            Map Component Placeholder - Live Driver Locations & Routes
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 