'use client'

import { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  Search,
  Plus,
  Calendar,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { Invoice, InvoiceItem } from '@/types/invoice'
import PrintInvoice from '@/components/invoice/PrintInvoice'
import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal'

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use a constant logo path
  const companyLogo = '/Logo-matters-1.webp'

  const printRef = useRef<HTMLDivElement>(null)

  // Load invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/invoices')

        if (!response.ok) {
          throw new Error('Failed to fetch invoices')
        }

        const data = await response.json()
        setInvoices(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching invoices:', err)
        setError('Failed to load invoices. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  // Using type assertion to fix type issues with useReactToPrint
  const handlePrint = useReactToPrint({
    // @ts-ignore - Type definitions for react-to-print may be outdated
    content: () => printRef.current,
    documentTitle: `Invoice-${selectedInvoice?.invoiceNumber || 'print'}`,
  });

  const handleAddInvoice = async (invoiceData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    date: string
    dueDate: string
    items: InvoiceItem[]
    subtotal: number
    tax: number
    total: number
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Creating invoice with data:', JSON.stringify(invoiceData, null, 2))

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Server error response:', responseData)
        throw new Error(responseData.error || 'Failed to create invoice')
      }

      console.log('Invoice created successfully:', responseData)

      const newInvoice = responseData

      // Convert snake_case to camelCase for consistency
      const formattedInvoice: Invoice = {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoice_number,
        customerName: newInvoice.customer_name,
        customerEmail: newInvoice.customer_email,
        customerPhone: newInvoice.customer_phone,
        customerAddress: newInvoice.customer_address,
        date: newInvoice.date,
        dueDate: newInvoice.due_date,
        items: newInvoice.items,
        subtotal: newInvoice.subtotal,
        tax: newInvoice.tax,
        total: newInvoice.total,
        status: newInvoice.status,
        notes: newInvoice.notes,
        paidDate: newInvoice.paid_date,
        createdAt: newInvoice.created_at,
        updatedAt: newInvoice.updated_at,
      }

      setInvoices([formattedInvoice, ...invoices])
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error creating invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to create invoice. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (invoice: Invoice, newStatus: 'pending' | 'paid' | 'overdue' | 'cancelled') => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invoice,
          status: newStatus,
          paidDate: newStatus === 'paid' ? format(new Date(), 'yyyy-MM-dd') : invoice.paidDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update invoice status')
      }

      const updatedInvoice = await response.json()

      setInvoices(invoices.map(inv =>
        inv.id === updatedInvoice.id ? {
          ...updatedInvoice,
          // Convert snake_case to camelCase
          invoiceNumber: updatedInvoice.invoice_number,
          customerName: updatedInvoice.customer_name,
          customerEmail: updatedInvoice.customer_email,
          customerPhone: updatedInvoice.customer_phone,
          customerAddress: updatedInvoice.customer_address,
          dueDate: updatedInvoice.due_date,
          paidDate: updatedInvoice.paid_date,
          createdAt: updatedInvoice.created_at,
          updatedAt: updatedInvoice.updated_at,
        } : inv
      ))
    } catch (err) {
      console.error('Error updating invoice status:', err)
      setError('Failed to update invoice status. Please try again.')
    }
  }

  // Filter invoices based on search query and date filter
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.customerEmail && invoice.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDate = !dateFilter || invoice.date.includes(dateFilter)

    return matchesSearch && matchesDate
  })

  // Calculate metrics
  const totalInvoices = invoices.length
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="px-4 py-6 lg:pl-4 lg:pr-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Manage Invoices</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex items-center justify-center px-4 py-2 bg-[#2D6BFF] text-white rounded-lg hover:bg-[#2D6BFF]/90 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold mt-1">{totalInvoices}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold mt-1">{pendingInvoices}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold mt-1">{paidInvoices}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold mt-1">{overdueInvoices}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by number, customer name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Invoices table */}
      {!isLoading && filteredInvoices.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || dateFilter
              ? 'Try adjusting your search or filters'
              : 'Create your first invoice to get started'}
          </p>
          {!searchQuery && !dateFilter && (
            <button
              className="inline-flex items-center px-6 py-3 bg-[#2D6BFF] text-white rounded-lg hover:bg-[#2D6BFF]/90 transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                    {invoice.customerEmail && (
                      <div className="text-sm text-gray-500 mt-1">{invoice.customerEmail}</div>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${invoice.total.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(invoice.status)}
                      <span className="ml-2 text-sm font-medium capitalize">
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setShowPrintModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <div className="relative group">
                        <button className="text-gray-600 hover:text-gray-900">
                          <span className="sr-only">Change status</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg py-1 z-10 hidden group-hover:block border border-gray-100">
                          <button
                            onClick={() => handleStatusChange(invoice, 'pending')}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={invoice.status === 'pending'}
                          >
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            Mark as Pending
                          </button>
                          <button
                            onClick={() => handleStatusChange(invoice, 'paid')}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={invoice.status === 'paid'}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => handleStatusChange(invoice, 'overdue')}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={invoice.status === 'overdue'}
                          >
                            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                            Mark as Overdue
                          </button>
                          <button
                            onClick={() => handleStatusChange(invoice, 'cancelled')}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={invoice.status === 'cancelled'}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                            Mark as Cancelled
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          onAdd={handleAddInvoice}
        />
      )}

      {/* Print Invoice Modal */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Print Invoice</h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div ref={printRef}>
                <PrintInvoice invoice={selectedInvoice} companyLogo={companyLogo} />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handlePrint()}
                  className="flex items-center px-6 py-3 bg-[#2D6BFF] text-white rounded-lg hover:bg-[#2D6BFF]/90 transition-colors"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 