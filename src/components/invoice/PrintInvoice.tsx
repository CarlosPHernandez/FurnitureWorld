'use client'

import { forwardRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { BusinessInfo } from '@/contexts/BusinessContext'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

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
    if (!businessInfo) return 'City, State 12345';
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
          <div className={`flex items-center px-3 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="ml-2 font-medium capitalize">{statusInfo.label}</span>
          </div>

          <select
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={invoice.status || 'pending'}
            onChange={(e) => onStatusChange(e.target.value as any)}
          >
            <option value="pending">Change to Pending</option>
            <option value="paid">Change to Paid</option>
            <option value="overdue">Change to Overdue</option>
            <option value="cancelled">Change to Cancelled</option>
          </select>
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
            <h2 className="text-xl font-bold text-gray-900">{businessInfo?.companyName || 'Family Mattress'}</h2>
          )}
          <p className="text-gray-600">{businessInfo?.address || '123 Furniture Street'}</p>
          <p className="text-gray-600">{formatAddress()}</p>
          <p className="text-gray-600">Phone: {businessInfo?.phone || '(555) 123-4567'}</p>
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
        <p className="text-gray-900 font-medium">{invoice.customerName}</p>
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

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-gray-600">Invoice Date:</p>
          <p className="text-gray-900">{invoice.date}</p>
        </div>
        <div>
          <p className="text-gray-600">Due Date:</p>
          <p className="text-gray-900">{invoice.dueDate}</p>
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
        <p className="mt-4">For questions regarding this invoice, please contact us at {businessInfo?.phone || '(555) 123-4567'}</p>
        {businessInfo?.email && (
          <p className="mt-1">or via email at {businessInfo.email}</p>
        )}
      </div>
    </div>
  )
})

PrintInvoice.displayName = 'PrintInvoice'

export default PrintInvoice 