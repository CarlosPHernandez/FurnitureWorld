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
  XCircle,
  Download,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { Invoice, InvoiceItem } from '@/types/invoice'
import PrintInvoice from '@/components/invoice/PrintInvoice'
import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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

  // Download PDF function
  const handleDownloadPdf = async () => {
    if (!printRef.current || !selectedInvoice) return;

    try {
      setIsGeneratingPdf(true);

      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');

      // Document dimensions based on standard US Letter (8.5 x 11 inches)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [8.5, 11]
      });

      // Calculate the dimensions to maintain aspect ratio
      const imgWidth = 8.5; // Width of US Letter paper in inches
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${selectedInvoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
        let errorMessage = responseData.error || 'Failed to create invoice'

        if (responseData.details) {
          errorMessage += `: ${responseData.details}`
        }

        if (responseData.hint) {
          errorMessage += ` (${responseData.hint})`
        }

        throw new Error(errorMessage)
      }

      console.log('Invoice created successfully:', responseData)

      const newInvoice = responseData

      // Add it to the invoices array
      setInvoices(prevInvoices => [newInvoice, ...prevInvoices])

      // Close the modal
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error adding invoice:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      alert(`Error creating invoice: ${err instanceof Error ? err.message : 'An unknown error occurred'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (invoice: Invoice, newStatus: 'pending' | 'paid' | 'overdue' | 'cancelled') => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          paidDate: newStatus === 'paid' ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update invoice status')
      }

      const updatedInvoice = await response.json()

      // Update the invoice in the state
      setInvoices(prevInvoices =>
        prevInvoices.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      )
    } catch (err) {
      console.error('Error updating invoice status:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtered invoices for the table
  const filteredInvoices = invoices.filter(invoice => {
    const matchesQuery = searchQuery
      ? invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    if (!dateFilter) {
      return matchesQuery
    }

    const invoiceDate = new Date(invoice.date)
    const filterDate = new Date(dateFilter)

    // Compare only the date part (not time)
    return (
      matchesQuery &&
      invoiceDate.getDate() === filterDate.getDate() &&
      invoiceDate.getMonth() === filterDate.getMonth() &&
      invoiceDate.getFullYear() === filterDate.getFullYear()
    )
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
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or invoice number"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-44"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#2D6BFF] text-white rounded-lg px-4 py-2 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      {isLoading && !invoices.length ? (
        <div className="p-8 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Invoice: {selectedInvoice.invoiceNumber}</h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Controls and Preview Toggle */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
              <div className="flex items-center">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-gray-700 hover:text-blue-600 mr-6"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => handlePrint()}
                  className="flex items-center px-4 py-2 bg-[#2D6BFF] text-white rounded-lg hover:bg-[#2D6BFF]/90"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print
                </button>
              </div>
            </div>

            {/* Invoice Preview with Scrolling */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className={`mx-auto ${showPreview ? '' : 'hidden'}`}>
                <div ref={printRef}>
                  <PrintInvoice invoice={selectedInvoice} companyLogo={companyLogo} showPreview={showPreview} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 