'use client'

import { useState, useRef, useEffect } from 'react'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  DollarSign,
  BarChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal'
import PrintInvoice from '@/components/invoice/PrintInvoice'

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
}

export default function InvoiceManagement() {
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Example data - replace with actual data from your database
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '(555) 123-4567',
      customerAddress: '789 Customer Street\nCity, State 12345',
      date: '2024-02-22',
      dueDate: '2024-03-22',
      items: [
        {
          description: '3-Seater Sofa',
          quantity: 1,
          unitPrice: 899.99,
          total: 899.99
        },
        {
          description: 'Coffee Table',
          quantity: 1,
          unitPrice: 299.99,
          total: 299.99
        }
      ],
      subtotal: 1199.98,
      tax: 96.00,
      total: 1295.98,
      status: 'paid',
      paymentDate: '2024-02-25'
    }
  ])

  // Load invoices from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices')
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices))
    }
  }, [])

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices))
  }, [invoices])

  // Calculate revenue metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0)
  const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.total : 0), 0)
  const overdueRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'overdue' ? inv.total : 0), 0)

  const handleAddInvoice = (newInvoice: Omit<Invoice, 'id' | 'status' | 'invoiceNumber'>) => {
    const invoice: Invoice = {
      ...newInvoice,
      id: `${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(3, '0')}`,
      status: 'pending'
    }
    setInvoices([...invoices, invoice])
  }

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsPrintModalOpen(true)
    // Give time for the modal to render before printing
    setTimeout(() => {
      if (printRef.current) {
        const content = printRef.current
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Invoice</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              </head>
              <body>
                ${content.innerHTML}
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
          printWindow.print()
          printWindow.close()
        }
      }
    }, 100)
  }

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Finance</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Invoice Management</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCreatingInvoice(true)}
              className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-6 w-6 text-[#00C48C]" />
              <span className="text-sm font-medium text-[#00C48C]">+12.5%</span>
            </div>
            <h3 className="text-gray-500 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-6 w-6 text-[#2D6BFF]" />
              <span className="text-sm font-medium text-[#2D6BFF]">{invoices.filter(i => i.status === 'pending').length} pending</span>
            </div>
            <h3 className="text-gray-500 text-sm">Pending Payments</h3>
            <p className="text-2xl font-bold mt-2">${pendingRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="h-6 w-6 text-[#FF3B30]" />
              <span className="text-sm font-medium text-[#FF3B30]">{invoices.filter(i => i.status === 'overdue').length} overdue</span>
            </div>
            <h3 className="text-gray-500 text-sm">Overdue Payments</h3>
            <p className="text-2xl font-bold mt-2">${overdueRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
            <Download className="mr-2 h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-[#2D6BFF]">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.dueDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-[#00C48C]/10 text-[#00C48C]'
                          : invoice.status === 'pending'
                          ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                          : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-[#2D6BFF]">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePrint(invoice)}
                          className="text-gray-400 hover:text-[#2D6BFF]"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreatingInvoice}
        onClose={() => setIsCreatingInvoice(false)}
        onAdd={handleAddInvoice}
      />

      {/* Print Modal */}
      {isPrintModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PrintInvoice ref={printRef} invoice={selectedInvoice} />
          </div>
        </div>
      )}
    </DeliveryLayout>
  )
} 