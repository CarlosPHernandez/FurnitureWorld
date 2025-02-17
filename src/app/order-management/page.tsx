'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  ChevronRight,
  Plus,
  Search,
  Filter,
  Upload,
  Package,
  Calendar,
  MapPin,
  Clock,
  FileText,
  Users,
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react'
import Image from 'next/image'

const orders = [
  {
    id: 'FDO-1234',
    customer: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001'
    },
    items: [
      {
        name: '3-Seater Sofa',
        quantity: 1,
        dimensions: '220x85x70 cm',
        weight: '45 kg',
        assembly_required: true
      },
      {
        name: 'Coffee Table',
        quantity: 1,
        dimensions: '120x60x45 cm',
        weight: '15 kg',
        assembly_required: false
      }
    ],
    status: 'Pending',
    delivery_date: '2024-02-20',
    delivery_slot: '09:00 - 12:00',
    special_instructions: 'Elevator available, delivery to 3rd floor',
    created_at: '2024-02-18 14:30'
  },
  {
    id: 'FDO-1235',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah.w@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Park Ave, New York, NY 10022'
    },
    items: [
      {
        name: 'Dining Set',
        quantity: 1,
        dimensions: '180x90x75 cm (table), 45x45x95 cm (chairs)',
        weight: '85 kg total',
        assembly_required: true
      }
    ],
    status: 'Scheduled',
    delivery_date: '2024-02-21',
    delivery_slot: '13:00 - 16:00',
    special_instructions: 'No elevator, stairs only',
    created_at: '2024-02-18 15:45'
  }
]

export default function OrderManagement() {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Orders</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Order Management</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Upload className="mr-2 h-4 w-4" />
              <span>Import CSV</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                />
              </div>
            </div>
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Delivery Date</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Package className="mr-2 h-4 w-4" />
              <span>Status</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Filter className="mr-2 h-4 w-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Order ID
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Delivery Date
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#2D6BFF]">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.map((item, index) => (
                          <div key={index} className="mb-1">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.delivery_date}</div>
                      <div className="text-sm text-gray-500">{order.delivery_slot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Pending'
                          ? 'bg-[#FF9500]/10 text-[#FF9500]'
                          : order.status === 'Scheduled'
                          ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                          : 'bg-[#00C48C]/10 text-[#00C48C]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 