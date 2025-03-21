'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import type { CustomerCredit } from '@/services/credit'

interface PaymentReceiptProps {
  customer: CustomerCredit
  payment: {
    amount: number
    method: string
    reference: string
    date: string
  }
  receiptNumber: string
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(({ customer, payment, receiptNumber }, ref) => {
  // Format date for display
  const formattedDate = format(new Date(payment.date), 'MMMM d, yyyy')

  return (
    <div
      ref={ref}
      className="bg-white p-8 max-w-[8.5in] mx-auto"
      style={{
        minHeight: '11in',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12pt'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PAYMENT RECEIPT</h1>
          <p className="text-gray-600 mt-1">Receipt #: {receiptNumber}</p>
          <p className="text-gray-600">Date: {formattedDate}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="mb-2 relative" style={{ width: '150px', height: '60px' }}>
            <Image
              src="/Logo-matters-1.webp"
              alt="Family Mattress"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-gray-600">123 Furniture Street</p>
          <p className="text-gray-600">City, State 12345</p>
          <p className="text-gray-600">Phone: (555) 123-4567</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-gray-600 font-medium mb-2">Customer Information:</h3>
        <p className="text-gray-900 font-medium">{customer.fullName}</p>
        {customer.address && (
          <p className="text-gray-600">{customer.address}</p>
        )}
        {customer.phoneNumber && (
          <p className="text-gray-600">Phone: {customer.phoneNumber}</p>
        )}
        <p className="text-gray-600">Account #: {customer.id.slice(0, 8)}</p>
      </div>

      {/* Payment Info */}
      <div className="border-t border-b border-gray-200 py-6 mb-8">
        <h3 className="text-gray-600 font-medium mb-4">Payment Details:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Payment Amount:</p>
            <p className="text-gray-900 font-bold text-xl">${payment.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Payment Method:</p>
            <p className="text-gray-900">{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</p>
          </div>
          {payment.reference && (
            <div>
              <p className="text-gray-600">Reference Number:</p>
              <p className="text-gray-900">{payment.reference}</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Summary */}
      <div className="mb-8">
        <h3 className="text-gray-600 font-medium mb-4">Account Summary:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Original Balance:</p>
            <p className="text-gray-900">${customer.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Previous Balance:</p>
            <p className="text-gray-900">${(customer.remainingBalance + payment.amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">New Balance:</p>
            <p className="text-gray-900">${customer.remainingBalance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Payment Schedule:</p>
            <p className="text-gray-900">{customer.paymentFrequency} - ${customer.paymentAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm mt-16">
        <p>Thank you for your payment!</p>
        <p className="mt-1">Please keep this receipt for your records.</p>
        <p className="mt-4">If you have any questions regarding this receipt, please contact our customer service at (555) 123-4567</p>
      </div>
    </div>
  )
})

PaymentReceipt.displayName = 'PaymentReceipt'

export default PaymentReceipt 