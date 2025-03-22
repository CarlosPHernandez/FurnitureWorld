'use client'

import { forwardRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { BusinessInfo } from '@/contexts/BusinessContext'
import { CheckCircle, Clock, AlertCircle, XCircle, User, Phone, Mail, MapPin, Package, Calendar, DollarSign, ReceiptText } from 'lucide-react'

interface PrintInvoiceProps {
  invoice: {
    id?: string
    invoiceNumber: string
    customerName: string
    customerEmail?: string
    customerPhone?: string
    customerAddress?: string
    date: string
    dueDate: string
    items: {
      description: string
      quantity: number
      unitPrice: number
      total: number
    }[]
    subtotal: number
    tax: number
    total: number
    notes?: string
    status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
  }
  companyLogo?: string
  showPreview?: boolean
  businessInfo?: BusinessInfo
  onStatusChange?: (newStatus: 'pending' | 'paid' | 'overdue' | 'cancelled') => void
}

const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(({
  invoice,
  companyLogo,
  showPreview,
  businessInfo,
  onStatusChange
}, ref) => {
  const [logoError, setLogoError] = useState(false);
  const [previewMode, setPreviewMode] = useState(showPreview || false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    if (showPreview !== undefined) {
      setPreviewMode(showPreview);
    }
  }, [showPreview]);

  // Handle logo error/fallback
  const handleLogoError = () => {
    setLogoError(true);
  };

  // Format company address
  const formatAddress = () => {
    if (!businessInfo) return 'Burlington, NC 27217';
    return `${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}`;
  }

  // Get status display information
  const getStatusInfo = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return { icon: <Clock className="h-5 w-5 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'paid':
        return { icon: <CheckCircle className="h-5 w-5 text-green-500" />, color: 'bg-green-100 text-green-800', label: 'Paid' };
      case 'overdue':
        return { icon: <AlertCircle className="h-5 w-5 text-red-500" />, color: 'bg-red-100 text-red-800', label: 'Overdue' };
      case 'cancelled':
        return { icon: <XCircle className="h-5 w-5 text-gray-500" />, color: 'bg-gray-100 text-gray-800', label: 'Cancelled' };
      default:
        return { icon: <Clock className="h-5 w-5 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    }
  };

  const statusInfo = getStatusInfo(invoice.status);

  // Handle date change
  const handleDateChange = (field: 'date' | 'dueDate', value: string) => {
    if (invoice.id && onStatusChange) {
      // We'll use the same onStatusChange callback to update dates
      // The actual API call is handled in the parent component
      window.dispatchEvent(new CustomEvent('invoice-date-change', {
        detail: {
          invoiceId: invoice.id,
          field,
          value
        }
      }));
    }
  };

  return (
    <div
      ref={ref}
      className={`${previewMode ? 'p-0 mx-auto shadow-lg' : 'p-8'} bg-white ${previewMode ? 'max-w-[8.5in] min-h-[11in] border-0 rounded-lg shadow-xl' : ''}`}
      style={previewMode ? {
        width: '8.5in',
        minHeight: '11in',
        padding: '0.5in',
        boxSizing: 'border-box'
      } : {}}
    >
      {/* Preview Watermark (only visible in preview mode) */}
      {previewMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-45 text-gray-200 text-9xl font-bold opacity-10">
            PREVIEW
          </div>
        </div>
      )}

      {/* Status selector in preview mode */}
      {previewMode && onStatusChange && invoice.id && (
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <div
            className={`flex items-center px-3 py-1.5 rounded-md ${statusInfo.color} shadow-sm hover:shadow-md cursor-pointer transition-all`}
            onClick={() => {
              // Cycle through statuses on click: pending -> paid -> overdue -> cancelled -> pending
              const statusOrder = ['pending', 'paid', 'overdue', 'cancelled'];
              const currentIndex = statusOrder.indexOf(invoice.status || 'pending');
              const nextIndex = (currentIndex + 1) % statusOrder.length;
              onStatusChange(statusOrder[nextIndex] as any);
            }}
          >
            {statusInfo.icon}
            <span className="ml-2 font-medium capitalize">{statusInfo.label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-70" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" transform="rotate(45 10 10)" />
            </svg>
          </div>

          <div className="relative inline-block">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              value={invoice.status || 'pending'}
              onChange={(e) => onStatusChange(e.target.value as any)}
              aria-label="Change invoice status"
            >
              <option value="pending">Change to Pending</option>
              <option value="paid">Change to Paid</option>
              <option value="overdue">Change to Overdue</option>
              <option value="cancelled">Change to Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600 mt-1">{invoice.invoiceNumber}</p>

          {/* Display status badge on printed invoice */}
          {!previewMode && invoice.status && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full mt-2 ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="ml-2 text-sm font-medium capitalize">{statusInfo.label}</span>
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          {companyLogo && !logoError ? (
            <div className="mb-2 relative" style={{ width: '150px', height: '60px' }}>
              <Image
                src={companyLogo}
                alt="Company Logo"
                fill
                className="object-contain"
                onError={handleLogoError}
                priority
              />
            </div>
          ) : (
            <h2 className="text-xl font-bold text-gray-900">{businessInfo?.companyName || 'Family Mattress and Furniture'}</h2>
          )}
          <p className="text-gray-600">{businessInfo?.address || '924 E Webb Ave'}</p>
          <p className="text-gray-600">{formatAddress()}</p>
          <p className="text-gray-600">Phone: {businessInfo?.phone || '(336) 524-6378'}</p>
          {businessInfo?.email && (
            <p className="text-gray-600">Email: {businessInfo.email}</p>
          )}
          {businessInfo?.website && (
            <p className="text-gray-600">Web: {businessInfo.website}</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-gray-600 font-medium mb-2">Bill To:</h3>
        <div
          className={`${invoice.id ? 'group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors' : ''}`}
          onClick={() => invoice.id && setShowCustomerModal(true)}
        >
          <p className="text-gray-900 font-medium flex items-center">
            <span>{invoice.customerName}</span>
            {invoice.id && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H7a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </p>
        {invoice.customerAddress && (
          <p className="text-gray-600 mt-1">{invoice.customerAddress}</p>
        )}
        {invoice.customerPhone && (
          <p className="text-gray-600 mt-1">Phone: {invoice.customerPhone}</p>
        )}
        {invoice.customerEmail && (
          <p className="text-gray-600 mt-1">Email: {invoice.customerEmail}</p>
        )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-gray-600 flex items-center">
            Invoice Date:
            {previewMode && invoice.id && (
              <span className="ml-1 text-blue-500 text-xs">(editable)</span>
            )}
          </p>
          {previewMode && invoice.id ? (
            <div className="relative">
              <input
                type="date"
                value={invoice.date}
                onChange={(e) => handleDateChange('date', e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 text-gray-900"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          ) : (
          <p className="text-gray-900">{invoice.date}</p>
          )}
        </div>
        <div>
          <p className="text-gray-600 flex items-center">
            Due Date:
            {previewMode && invoice.id && (
              <span className="ml-1 text-blue-500 text-xs">(editable)</span>
            )}
          </p>
          {previewMode && invoice.id ? (
            <div className="relative">
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => handleDateChange('dueDate', e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 text-gray-900"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          ) : (
          <p className="text-gray-900">{invoice.dueDate}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">Description</th>
            <th className="text-right py-3 px-4">Quantity</th>
            <th className="text-right py-3 px-4">Unit Price</th>
            <th className="text-right py-3 px-4">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3 px-4">{item.description}</td>
              <td className="text-right py-3 px-4">{item.quantity}</td>
              <td className="text-right py-3 px-4">${item.unitPrice.toFixed(2)}</td>
              <td className="text-right py-3 px-4">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">
              {invoice.tax > 0 ? 'Tax (6.75%):' : 'Tax (0%):'}
            </span>
            <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-gray-600 font-medium mb-2">Notes:</h3>
          <p className="text-gray-900 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm mt-16">
        <p>Thank you for your business!</p>
        <p className="mt-1">Payment is due by {invoice.dueDate}</p>
        <p className="mt-4">For questions regarding this invoice, please contact us at {businessInfo?.phone || '(336) 524-6378'}</p>
        {businessInfo?.email && (
          <p className="mt-1">or via email at {businessInfo.email}</p>
        )}
      </div>

      {/* Customer Info Modal */}
      {showCustomerModal && invoice.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Customer Information</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{invoice.customerName}</h3>
                    <p className="text-sm text-gray-500">Customer ID: {invoice.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {invoice.customerAddress && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
                      </div>
                    </div>
                  )}

                  {invoice.customerPhone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
                      </div>
                    </div>
                  )}

                  {invoice.customerEmail && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-1">
                      <ReceiptText className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-700">Invoice #</p>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-700">Date</p>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.date}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-700">Total</p>
                    </div>
                    <p className="text-sm text-gray-600">${invoice.total.toFixed(2)}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-1">
                      {statusInfo.icon}
                      <p className="text-sm font-medium text-gray-700">Status</p>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{invoice.status || 'pending'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Purchased Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                {invoice.status !== 'paid' && (
                  <button
                    onClick={() => {
                      onStatusChange && onStatusChange('paid');
                      setShowCustomerModal(false);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PrintInvoice.displayName = 'PrintInvoice'

export default PrintInvoice 