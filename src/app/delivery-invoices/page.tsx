'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  ChevronRight,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Printer,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'

const invoiceList = [
  {
    id: 'INV-2024-001',
    customer: 'Tech Solutions Inc.',
    amount: '$2,450.00',
    date: 'Feb 15, 2024',
    status: 'Paid',
    logo: 'https://picsum.photos/seed/1/40/40'
  },
  {
    id: 'INV-2024-002',
    customer: 'Global Logistics Ltd.',
    amount: '$1,850.00',
    date: 'Feb 14, 2024',
    status: 'Pending',
    logo: 'https://picsum.photos/seed/2/40/40'
  },
  {
    id: 'INV-2024-003',
    customer: 'Express Delivery Co.',
    amount: '$3,200.00',
    date: 'Feb 13, 2024',
    status: 'Overdue',
    logo: 'https://picsum.photos/seed/3/40/40'
  }
]

const templates = [
  {
    id: 1,
    name: 'Standard Invoice',
    description: 'Basic invoice template with essential details',
    preview: 'https://picsum.photos/seed/4/120/160'
  },
  {
    id: 2,
    name: 'Detailed Invoice',
    description: 'Comprehensive invoice with delivery breakdown',
    preview: 'https://picsum.photos/seed/5/120/160'
  },
  {
    id: 3,
    name: 'Professional Invoice',
    description: 'Premium design with company branding',
    preview: 'https://picsum.photos/seed/6/120/160'
  }
]

export default function DeliveryInvoices() {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Finance</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Invoices</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Recent Invoices
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {invoiceList.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={invoice.logo}
                        alt={invoice.customer}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-[#1A1A1A]">{invoice.customer}</h3>
                        <p className="text-sm text-gray-500">{invoice.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-medium text-[#1A1A1A]">{invoice.amount}</p>
                        <p className="text-sm text-gray-500">{invoice.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        invoice.status === 'Paid'
                          ? 'bg-[#00C48C]/10 text-[#00C48C]'
                          : invoice.status === 'Pending'
                          ? 'bg-[#FFB800]/10 text-[#FFB800]'
                          : 'bg-[#FF9500]/10 text-[#FF9500]'
                      }`}>
                        {invoice.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Download className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Printer className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Invoice Templates
            </h2>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Image
                    src={template.preview}
                    alt={template.name}
                    width={120}
                    height={160}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-[#1A1A1A] mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 