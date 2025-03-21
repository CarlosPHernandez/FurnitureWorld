'use client'

import { useState, useRef, useCallback } from 'react'
import { DollarSign, Printer, CheckCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useReactToPrint } from 'react-to-print'
import PaymentReceipt from './PaymentReceipt'
import type { CustomerCredit } from '@/services/credit'

interface PaymentFormProps {
  customerId: string
  customerName: string
  remainingBalance: number
  customer: CustomerCredit
  onClose: () => void
  onSubmit: (payment: {
    amount: number
    method: string
    reference: string
    date: string
  }) => Promise<void>
  isSubmitting?: boolean
}

export default function PaymentForm({
  customerId,
  customerName,
  remainingBalance,
  customer,
  onClose,
  onSubmit,
  isSubmitting = false
}: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState('')
  const receiptRef = useRef<HTMLDivElement>(null)

  // Use callback to create print handler
  const handlePrintReceipt = useCallback(() => {
    if (receiptRef.current) {
      // Create a new print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this site to print receipts');
        return;
      }

      // Write receipt content to the new window
      const receiptContent = receiptRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .receipt-content { max-width: 800px; margin: 0 auto; }
              @media print {
                body { margin: 0; padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-content">${receiptContent}</div>
            <div style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()">Print Receipt</button>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(paymentData)
      // Generate a receipt number
      const timestamp = new Date().getTime().toString().slice(-6)
      const newReceiptNumber = `RCP-${timestamp}-${customerId.slice(0, 6)}`
      setReceiptNumber(newReceiptNumber)
      setIsSuccess(true)
    } catch (error) {
      console.error('Payment submission error:', error)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Payment Recorded</h2>
            <p className="text-gray-600 mt-2">
              Payment of ${paymentData.amount.toFixed(2)} has been successfully recorded.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handlePrintReceipt}
              className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Hidden receipt for printing */}
          <div className="hidden">
            <PaymentReceipt
              ref={receiptRef}
              customer={customer}
              payment={paymentData}
              receiptNumber={receiptNumber}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer</label>
            <div className="text-sm text-gray-900">{customerName}</div>
            <div className="text-xs text-gray-500">#{customerId}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Remaining Balance</label>
            <div className="text-sm font-medium text-gray-900">${remainingBalance.toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                max={remainingBalance}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
            <select
              value={paymentData.method}
              onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="debit">Debit Card</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reference Number</label>
            <input
              type="text"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              placeholder="Check number, transaction ID, etc."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentData.date}
              onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" text="" icon="sofa" className="mr-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 