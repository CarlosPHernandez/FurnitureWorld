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
            <title>Payment Receipt - ${customer.fullName}</title>
            <style>
              /* Page setup */
              @page { 
                size: letter portrait;
                margin: 0.4in; 
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: white;
                color: black;
                font-size: 11pt;
              }
              * {
                color: black !important;
                border-color: black !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                box-sizing: border-box;
              }
              .receipt-content { 
                width: 100%;
                max-width: 7.7in; 
                margin: 0 auto; 
                padding: 0;
                background-color: white;
                color: black;
              }
              /* Control specific element sizes */
              h1 { font-size: 18pt; margin: 0 0 0.1in 0; }
              h2 { font-size: 14pt; margin: 0 0 0.1in 0; }
              h3 { font-size: 12pt; margin: 0 0 0.1in 0; }
              p { margin: 0 0 0.05in 0; }
              .compact-text { font-size: 10pt; }
              .print-button {
                background-color: #2D6BFF;
                color: white !important;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                margin: 20px auto;
                font-size: 14px;
              }
              .print-container {
                text-align: center;
                padding: 20px;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  background-color: white;
                  color: black;
                }
                .receipt-content {
                  padding: 0;
                  border: none;
                }
                .print-container {
                  display: none;
                }
                p, span, h1, h2, h3, div {
                  color: black !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt-content">${receiptContent}</div>
            <div class="print-container">
              <button 
                onclick="window.print()" 
                class="print-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Receipt
              </button>
            </div>
            <script>
              // Force black color for all elements to prevent faded text in print
              document.addEventListener('DOMContentLoaded', function() {
                const elements = document.querySelectorAll('*');
                elements.forEach(el => {
                  if (el.tagName !== 'BUTTON' && el.tagName !== 'svg') {
                    el.style.color = 'black';
                  }
                  if (el.style.borderColor) {
                    el.style.borderColor = 'black';
                  }
                });
                
                // Auto print after a short delay to ensure everything is loaded
                setTimeout(function() {
                  window.print();
                }, 500);
              });
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    }
  }, [customer.fullName]);

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
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Recorded</h2>
            <p className="text-gray-600">
              Payment of <span className="font-semibold text-green-600">${paymentData.amount.toFixed(2)}</span> has been successfully recorded.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handlePrintReceipt}
              className="flex items-center justify-center px-6 py-3 text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Printer className="mr-2 h-5 w-5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
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
              showPreview={false}
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