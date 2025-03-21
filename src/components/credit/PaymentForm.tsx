'use client'

import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PaymentFormProps {
  customerId: string
  customerName: string
  remainingBalance: number
  onClose: () => void
  onSubmit: (payment: {
    amount: number
    method: string
    reference: string
    date: string
  }) => void
  isSubmitting?: boolean
}

export default function PaymentForm({
  customerId,
  customerName,
  remainingBalance,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(paymentData)
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