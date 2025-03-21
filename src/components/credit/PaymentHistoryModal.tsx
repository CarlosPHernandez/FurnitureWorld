'use client'

import { useState } from 'react'
import { X, Package, Calendar, DollarSign, MapPin, Phone, User, CreditCard, Mail, FileText } from 'lucide-react'
import type { CustomerCredit } from '@/services/credit'

interface PaymentHistoryModalProps {
  customer: CustomerCredit
  onClose: () => void
}

export default function PaymentHistoryModal({ customer, onClose }: PaymentHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'items' | 'info'>('payments')

  // Sort payments by date (newest first)
  const sortedPayments = [...customer.payments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Calculate payment progress percentage
  const paymentProgress = customer.totalAmount > 0
    ? Math.min(100, ((customer.totalAmount - customer.remainingBalance) / customer.totalAmount) * 100)
    : 0

  // Calculate total paid amount
  const totalPaid = customer.totalAmount - customer.remainingBalance

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Customer Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer Info Summary */}
        <div className="bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">{customer.fullName}</h4>
          <div className="mt-1 text-sm text-gray-500">
            {/* Financial Summary */}
            <div className="flex items-center mt-2">
              <DollarSign className="h-4 w-4 mr-2 text-[#2D6BFF]" />
              <div>
                <p>Total Amount: ${customer.totalAmount.toFixed(2)}</p>
                <p>Paid: ${totalPaid.toFixed(2)}</p>
                <p>Remaining: ${customer.remainingBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 mr-2 text-[#2D6BFF]" />
              <p>Payment Schedule: {customer.paymentFrequency} - ${customer.paymentAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payment Progress</span>
              <span>{paymentProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#2D6BFF] h-2.5 rounded-full"
                style={{ width: `${paymentProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'payments'
              ? 'text-[#2D6BFF] border-b-2 border-[#2D6BFF]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'items'
              ? 'text-[#2D6BFF] border-b-2 border-[#2D6BFF]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('items')}
          >
            Items
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'info'
              ? 'text-[#2D6BFF] border-b-2 border-[#2D6BFF]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
        </div>

        {/* Payment List */}
        {activeTab === 'payments' && (
          <div className="flex-1 overflow-y-auto p-4">
            {sortedPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payment history available
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPayments.map((payment, index) => (
                  <div key={index} className="bg-white border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">${payment.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-1 text-sm">
                      <p>Method: {payment.method}</p>
                      {payment.reference && <p>Reference: {payment.reference}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Financed Items Section */}
        {activeTab === 'items' && (
          <div className="flex-1 overflow-y-auto p-4">
            {customer.itemsFinanced.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No financed items available
              </div>
            ) : (
              <div className="space-y-4">
                {customer.itemsFinanced.map((item, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Package className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer Information Section */}
        {activeTab === 'info' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Contact Information */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 mr-2 text-[#2D6BFF]" />
                  <h4 className="font-medium">Contact Information</h4>
                </div>
                <div className="ml-7 space-y-2">
                  {customer.address ? (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-700">Address</p>
                        <p className="text-sm">{customer.address}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No address provided</p>
                  )}

                  {customer.phoneNumber ? (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-700">Phone</p>
                        <p className="text-sm">{customer.phoneNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No phone number provided</p>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 mr-2 text-[#2D6BFF]" />
                  <h4 className="font-medium">Personal Information</h4>
                </div>
                <div className="ml-7 space-y-2">
                  {customer.dateOfBirth ? (
                    <div>
                      <p className="text-sm text-gray-700">Date of Birth</p>
                      <p className="text-sm">{customer.dateOfBirth}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No date of birth provided</p>
                  )}

                  {customer.taxId ? (
                    <div>
                      <p className="text-sm text-gray-700">Tax ID</p>
                      <p className="text-sm">{customer.taxId}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tax ID provided</p>
                  )}

                  {customer.driversLicense ? (
                    <div>
                      <p className="text-sm text-gray-700">Driver's License</p>
                      <p className="text-sm">{customer.driversLicense}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No driver's license provided</p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 mr-2 text-[#2D6BFF]" />
                  <h4 className="font-medium">Payment Information</h4>
                </div>
                <div className="ml-7 space-y-2">
                  <div>
                    <p className="text-sm text-gray-700">Payment Method</p>
                    <p className="text-sm">{customer.paymentMethod}</p>
                  </div>

                  {customer.paymentMethod === 'credit' || customer.paymentMethod === 'debit' ? (
                    <>
                      {customer.cardName && (
                        <div>
                          <p className="text-sm text-gray-700">Card Name</p>
                          <p className="text-sm">{customer.cardName}</p>
                        </div>
                      )}

                      {customer.cardNumber && (
                        <div>
                          <p className="text-sm text-gray-700">Card Number</p>
                          <p className="text-sm">**** **** **** {customer.cardNumber.slice(-4)}</p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 