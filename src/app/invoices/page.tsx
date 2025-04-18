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
  Eye,
  Settings
} from 'lucide-react'
import { format } from 'date-fns'
import { Invoice, InvoiceItem } from '@/types/invoice'
import PrintInvoice from '@/components/invoice/PrintInvoice'
import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useBusinessInfo, BusinessInfo } from '@/contexts/BusinessContext'

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
  const [showBusinessSettingsModal, setShowBusinessSettingsModal] = useState(false)

  // Use the business context instead of local state
  const { businessInfo, updateBusinessInfo } = useBusinessInfo()

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
        console.log('Fetched invoices:', data) // Log for debugging

        // Ensure all invoices have a customer name
        const processedData = data.map((invoice: any) => ({
          ...invoice,
          customerName: invoice.customerName || 'Customer'
        }))

        setInvoices(processedData)
        setError(null)
      } catch (err) {
        console.error('Error fetching invoices:', err)
        setError('Failed to load invoices. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()

    // Set up event listener for invoice date changes
    const handleInvoiceDateChange = (event: CustomEvent) => {
      const { invoiceId, field, value } = event.detail;
      handleDateChange(invoiceId, field, value);
    };

    window.addEventListener('invoice-date-change', handleInvoiceDateChange as EventListener);

    return () => {
      window.removeEventListener('invoice-date-change', handleInvoiceDateChange as EventListener);
    };
  }, [])

  // Function to handle date changes
  const handleDateChange = async (invoiceId: string, field: 'date' | 'dueDate', value: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`Updating invoice ${invoiceId} ${field} to ${value}`);

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update invoice ${field}`);
      }

      const updatedInvoice = await response.json();
      console.log('Invoice updated successfully:', updatedInvoice);

      // Update the invoice in the state
      setInvoices(prevInvoices =>
        prevInvoices.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );

      // If this is the currently selected invoice, update it too
      if (selectedInvoice && selectedInvoice.id === updatedInvoice.id) {
        setSelectedInvoice(updatedInvoice);
      }

      // Show success message
      alert(`Invoice ${updatedInvoice.invoiceNumber} ${field === 'date' ? 'date' : 'due date'} updated successfully`);

    } catch (err) {
      console.error(`Error updating invoice ${field}:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed implementation of react-to-print
  const handlePrint = useReactToPrint({
    // @ts-ignore - Type definitions for react-to-print don't match the library
    content: () => printRef.current,
    documentTitle: `Invoice-${selectedInvoice?.invoiceNumber || 'print'}`,
    onBeforePrint: () => {
      console.log('Print content:', printRef.current);
      return Promise.resolve();
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
    }
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
      setIsLoading(true);
      setError(null);

      console.log(`Updating invoice ${invoice.id} status to ${newStatus}`);

      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          paidDate: newStatus === 'paid' ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice status');
      }

      const updatedInvoice = await response.json();
      console.log('Invoice updated successfully:', updatedInvoice);

      // Update the invoice in the state
      setInvoices(prevInvoices =>
        prevInvoices.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );

      // If this is the currently selected invoice, update it too
      if (selectedInvoice && selectedInvoice.id === updatedInvoice.id) {
        setSelectedInvoice(updatedInvoice);
      }

      // Show success message
      const statusMessage = {
        'pending': 'marked as pending',
        'paid': 'marked as paid',
        'overdue': 'marked as overdue',
        'cancelled': 'marked as cancelled'
      }[newStatus];

      // Use a temporary success message
      const tempSuccessMessage = `Invoice ${updatedInvoice.invoiceNumber} ${statusMessage}`;
      alert(tempSuccessMessage);

    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={() => setShowBusinessSettingsModal(true)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg px-4 py-2 flex items-center"
            title="Business Information Settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
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
                    <div
                      className="group flex items-start cursor-pointer"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPrintModal(true);
                      }}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 flex items-center">
                          {invoice.customerName || 'Customer'}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M11 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H7a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        {invoice.customerEmail && (
                          <div className="text-sm text-gray-500 mt-1">{invoice.customerEmail}</div>
                        )}
                        {invoice.customerPhone && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              {invoice.customerPhone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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
                      <div className="relative group">
                        <div className={`flex items-center px-2.5 py-1 rounded-md ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                          } cursor-pointer hover:shadow-sm transition-all`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1.5 text-sm font-medium capitalize">
                            {invoice.status}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>

                        {/* Dropdown menu */}
                        <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 hidden group-hover:block">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => handleStatusChange(invoice, 'pending')}
                              className={`flex items-center w-full px-4 py-2 text-sm text-left ${invoice.status === 'pending' ? 'bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              role="menuitem"
                            >
                              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                              <span>Pending</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(invoice, 'paid')}
                              className={`flex items-center w-full px-4 py-2 text-sm text-left ${invoice.status === 'paid' ? 'bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              role="menuitem"
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              <span>Paid</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(invoice, 'overdue')}
                              className={`flex items-center w-full px-4 py-2 text-sm text-left ${invoice.status === 'overdue' ? 'bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              role="menuitem"
                            >
                              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                              <span>Overdue</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(invoice, 'cancelled')}
                              className={`flex items-center w-full px-4 py-2 text-sm text-left ${invoice.status === 'cancelled' ? 'bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              role="menuitem"
                            >
                              <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Cancelled</span>
                            </button>
                          </div>
                        </div>
                      </div>
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
                        title="View and print invoice"
                      >
                        <Printer className="h-5 w-5" />
                      </button>
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invoice: {selectedInvoice.invoiceNumber}</h2>
                {selectedInvoice.id && (
                  <p className="text-sm text-gray-500 mt-1">
                    You can edit dates and status directly in the preview below.
                  </p>
                )}
              </div>
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
                <button
                  onClick={() => setShowBusinessSettingsModal(true)}
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Business Info
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
                  onClick={() => {
                    console.log('Print button clicked, printRef:', printRef.current);
                    handlePrint();
                  }}
                  className="flex items-center px-4 py-2 bg-[#2D6BFF] text-white rounded-lg hover:bg-[#2D6BFF]/90"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print
                </button>
              </div>
            </div>

            {/* Invoice Preview with Scrolling */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              {/* Visible preview for users */}
              <div className={`mx-auto ${showPreview ? '' : 'hidden'}`}>
                <PrintInvoice
                  invoice={{
                    ...selectedInvoice,
                    // Ensure customer info is always displayed
                    customerName: selectedInvoice.customerName || 'Customer',
                  }}
                  companyLogo={businessInfo.logoUrl}
                  showPreview={showPreview}
                  businessInfo={businessInfo}
                  onStatusChange={(newStatus) => {
                    if (selectedInvoice.id) {
                      handleStatusChange(selectedInvoice, newStatus);
                    }
                  }}
                />
              </div>

              {/* Hidden div for printing, always in DOM but visually hidden unless printing */}
              <div ref={printRef} className="hidden">
                <PrintInvoice
                  invoice={{
                    ...selectedInvoice,
                    // Ensure customer info is always displayed
                    customerName: selectedInvoice.customerName || 'Customer',
                  }}
                  companyLogo={businessInfo.logoUrl}
                  showPreview={true} /* Always show content in print ref */
                  businessInfo={businessInfo}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Information Settings Modal */}
      {showBusinessSettingsModal && (
        <BusinessSettingsModal
          businessInfo={businessInfo}
          setBusinessInfo={updateBusinessInfo}
          onClose={() => setShowBusinessSettingsModal(false)}
        />
      )}
    </div>
  )
}

interface BusinessSettingsModalProps {
  businessInfo: BusinessInfo
  setBusinessInfo: (newInfo: BusinessInfo) => void
  onClose: () => void
}

function BusinessSettingsModal({ businessInfo, setBusinessInfo, onClose }: BusinessSettingsModalProps) {
  const [tempBusinessInfo, setTempBusinessInfo] = useState({ ...businessInfo })
  const [logoPreview, setLogoPreview] = useState<string | null>(businessInfo.logoUrl)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTempBusinessInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setTempBusinessInfo(prev => ({ ...prev, logoUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setBusinessInfo(tempBusinessInfo)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Business Information Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {saveSuccess ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Saved</h3>
              <p className="text-gray-600">Your business information has been updated successfully.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Logo</h3>
                  <div className="flex items-start space-x-6">
                    <div className="w-40 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400">No logo</span>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2">
                        <span className="sr-only">Choose logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-medium
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </label>
                      <p className="text-xs text-gray-500">
                        Recommended size: 150 x 60px. PNG or JPEG.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={tempBusinessInfo.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={tempBusinessInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={tempBusinessInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={tempBusinessInfo.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={tempBusinessInfo.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={tempBusinessInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={tempBusinessInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={tempBusinessInfo.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 