'use client'

import { forwardRef, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { CheckCircle } from 'lucide-react'
import type { CustomerCredit } from '@/services/credit'
import { useBusinessInfo } from '@/contexts/BusinessContext'

interface PaymentReceiptProps {
  customer: CustomerCredit
  payment: {
    amount: number
    method: string
    reference: string
    date: string
  }
  receiptNumber: string
  showPreview?: boolean
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(({
  customer,
  payment,
  receiptNumber,
  showPreview = true
}, ref) => {
  // Format date for display
  const formattedDate = format(new Date(payment.date), 'MMMM d, yyyy')
  const { businessInfo } = useBusinessInfo()
  const [logoError, setLogoError] = useState(false)

  // Handle logo error/fallback
  const handleLogoError = () => {
    setLogoError(true)
  }

  // Format address
  const formatAddress = () => {
    return `${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}`
  }

  return (
    <div
      ref={ref}
      className={`${showPreview ? 'p-0 mx-auto shadow-lg' : ''} bg-white ${showPreview ? 'max-w-[8.5in] min-h-[11in] border-0 rounded-lg shadow-xl' : ''}`}
      style={showPreview ? {
        width: '8.5in',
        minHeight: '10in',
        padding: '0.4in',
        boxSizing: 'border-box',
        position: 'relative'
      } : {
        width: '8.5in',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
        color: '#000000',
        padding: '0.4in',
        boxSizing: 'border-box'
      }}
    >
      {/* Preview Watermark (only visible in preview mode) */}
      {showPreview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-45 text-gray-200 text-9xl font-bold opacity-10">
            PREVIEW
          </div>
        </div>
      )}

      {/* Payment status badge */}
      <div className="absolute top-3 right-4 flex items-center">
        <div className="flex items-center px-2 py-1 rounded-md bg-black text-white print:border print:border-black">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="font-medium text-sm">Payment Received</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 border-b border-black pb-3">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">PAYMENT RECEIPT</h1>
          <p className="text-black font-medium text-sm mt-1">Receipt #: {receiptNumber}</p>
          <p className="text-black text-sm">Date: {formattedDate}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          {businessInfo.logoUrl && !logoError ? (
            <div className="mb-2 relative" style={{ width: '120px', height: '50px' }}>
              <Image
                src={businessInfo.logoUrl}
                alt={businessInfo.companyName}
                fill
                className="object-contain"
                onError={handleLogoError}
                priority
              />
            </div>
          ) : (
            <h2 className="text-lg font-bold text-black">{businessInfo.companyName}</h2>
          )}
          <div className="text-sm">
            <p className="text-black">{businessInfo.address}</p>
            <p className="text-black">{formatAddress()}</p>
            <p className="text-black">Phone: {businessInfo.phone}</p>
            {businessInfo.email && (
              <p className="text-black">Email: {businessInfo.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Customer Info and Payment Info side by side */}
        <div className="flex justify-between gap-4">
          {/* Customer Info */}
          <div className="w-1/2">
            <h3 className="text-base font-bold text-black mb-1 pb-1 border-b border-black">Customer Information</h3>
            <div className="p-2 border border-black">
              <p className="text-black font-bold">{customer.fullName}</p>
              {customer.address && (
                <p className="text-black text-sm">{customer.address}</p>
              )}
              {customer.phoneNumber && (
                <p className="text-black text-sm">Phone: {customer.phoneNumber}</p>
              )}
              <p className="text-black text-sm mt-1">
                Account #: {customer.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="w-1/2">
            <h3 className="text-base font-bold text-black mb-1 pb-1 border-b border-black">Payment Details</h3>
            <div className="p-2 border border-black">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-black text-sm font-medium">Amount:</p>
                  <p className="text-black font-bold text-lg">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-black text-sm font-medium">Method:</p>
                  <p className="text-black">{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</p>
                </div>
                {payment.reference && (
                  <div className="col-span-2 mt-1">
                    <p className="text-black text-sm font-medium">Reference #:</p>
                    <p className="text-black">{payment.reference}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div>
          <h3 className="text-base font-bold text-black mb-1 pb-1 border-b border-black">Account Summary</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-2 border border-black">
              <p className="text-black text-sm font-medium">Original Balance:</p>
              <p className="text-black font-bold">${customer.totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-black text-sm font-medium">Previous Balance:</p>
              <p className="text-black font-bold">${(customer.remainingBalance + payment.amount).toFixed(2)}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-black text-sm font-medium">New Balance:</p>
              <p className="text-black font-bold">${customer.remainingBalance.toFixed(2)}</p>
            </div>
            <div className="p-2 border border-black">
              <p className="text-black text-sm font-medium">Payment Schedule:</p>
              <p className="text-black font-bold">{customer.paymentFrequency} - ${customer.paymentAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment progress indicator */}
        <div className="mb-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-black text-sm font-medium">Payment Progress:</p>
            <p className="text-black text-sm">
              ${(customer.totalAmount - customer.remainingBalance).toFixed(2)} of ${customer.totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="w-full bg-white border border-black h-3">
            <div
              className="h-3 bg-black"
              style={{ width: `${Math.min(100, (1 - customer.remainingBalance / customer.totalAmount) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-black pt-3 mt-1">
          <p className="text-sm font-bold text-black">Thank you for your payment!</p>
          <p className="text-black text-xs">Please keep this receipt for your records.</p>
          <div className="my-2 py-2">
            <p className="text-black text-xs">For questions regarding this receipt, please contact our customer service at {businessInfo.phone}</p>
            {businessInfo.email && (
              <p className="text-black text-xs">or via email at {businessInfo.email}</p>
            )}
          </div>
          <div className="text-xs text-black mt-1">
            Receipt generated on {new Date().toLocaleDateString()} by {businessInfo.companyName}
          </div>
        </div>
      </div>
    </div>
  )
})

PaymentReceipt.displayName = 'PaymentReceipt'

export default PaymentReceipt 