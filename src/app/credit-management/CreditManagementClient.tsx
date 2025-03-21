'use client'

import { useState } from 'react'
import {
  ChevronRight,
  Plus,
  Search,
  Filter,
  User,
  Clock,
} from 'lucide-react'
import type { CustomerCredit } from '@/services/credit'
import PaymentForm from '@/components/credit/PaymentForm'
import CreditApplicationForm from '@/components/credit/CreditApplicationForm'
import PaymentHistoryModal from '@/components/credit/PaymentHistoryModal'

interface CreditManagementClientProps {
  initialCreditAccounts: CustomerCredit[]
}

// Utility function to normalize credit account data
const normalizeCreditAccount = (account: any): CustomerCredit => {
  // Handle both snake_case and camelCase field names
  return {
    id: account.id,
    fullName: account.fullName || account.full_name || '',
    address: account.address || '',
    phoneNumber: account.phoneNumber || account.phone_number || '',
    dateOfBirth: account.dateOfBirth || account.date_of_birth || '',
    taxId: account.taxId || account.tax_id || '',
    driversLicense: account.driversLicense || account.drivers_license || '',
    paymentMethod: account.paymentMethod || account.payment_method || 'cash',
    cardName: account.cardName || account.card_name || '',
    cardNumber: account.cardNumber || account.card_number || '',
    paymentFrequency: account.paymentFrequency || account.payment_frequency || 'monthly',
    paymentAmount: Number(account.paymentAmount || account.payment_amount || 0),
    itemsFinanced: Array.isArray(account.itemsFinanced)
      ? account.itemsFinanced
      : (Array.isArray(account.items_financed) ? account.items_financed : []),
    totalAmount: Number(account.totalAmount || account.total_amount || 0),
    remainingBalance: Number(account.remainingBalance || account.remaining_balance || 0),
    payments: Array.isArray(account.payments) ? account.payments : [],
  }
}

export default function CreditManagementClient({ initialCreditAccounts }: CreditManagementClientProps) {
  // Normalize initial credit accounts
  const normalizedInitialAccounts = initialCreditAccounts.map(normalizeCreditAccount)

  const [showCreditApplicationForm, setShowCreditApplicationForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCredit | null>(null)
  const [creditAccounts, setCreditAccounts] = useState<CustomerCredit[]>(normalizedInitialAccounts)
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    dateOfBirth: '',
    taxId: '',
    driversLicense: '',
    paymentMethod: 'cash' as const,
    cardName: '',
    cardNumber: '',
    paymentFrequency: 'monthly' as const,
    paymentAmount: 0,
    itemsFinanced: [{ name: '', price: 0 }],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  const handleAddItem = () => {
    setFormData({
      ...formData,
      itemsFinanced: [...formData.itemsFinanced, { name: '', price: 0 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = formData.itemsFinanced.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      itemsFinanced: newItems
    })
  }

  const calculateTotal = () => {
    return formData.itemsFinanced.reduce((total, item) => total + item.price, 0)
  }

  const handleSubmitCreditApplication = async (applicationData: any) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      console.log('Submitting application data:', applicationData)

      const response = await fetch('/api/credit/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMsg = responseData.error || 'Failed to create credit account'
        console.error('API error:', errorMsg)
        setErrorMessage(errorMsg)
        throw new Error(errorMsg)
      }

      console.log('Credit account created successfully:', responseData)

      // Normalize the response data before adding to state
      const normalizedAccount = normalizeCreditAccount(responseData)

      // Update the local state with normalized data
      setCreditAccounts([normalizedAccount, ...creditAccounts])
      setShowCreditApplicationForm(false)
    } catch (error) {
      console.error('Error creating credit account:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create credit account. Please try again.')
      alert(error instanceof Error ? error.message : 'Failed to create credit account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/credit/test-connection')
      const data = await response.json()

      if (response.ok) {
        alert(`Connection successful! Count: ${data.count}`)
      } else {
        alert(`Connection failed: ${data.error}`)
      }
      console.log('Connection test result:', data)
    } catch (error) {
      console.error('Error testing connection:', error)
      alert(`Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleViewPaymentHistory = (account: CustomerCredit) => {
    setSelectedCustomer(account)
    setShowPaymentHistory(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white rounded-xl p-3 md:p-4 shadow-sm">
        <div className="flex items-center text-sm text-gray-500">
          <span>Finance</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-[#2D6BFF] font-medium">Credit Customers</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setShowCreditApplicationForm(true)}
            className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200 shadow-sm shadow-[#2D6BFF]/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Credit Application</span>
          </button>

          {/* Debug button - remove in production */}
          <button
            onClick={testDatabaseConnection}
            disabled={isTestingConnection}
            className="flex items-center justify-center px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            {isTestingConnection ? 'Testing...' : 'Test DB Connection'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
            />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
          <Filter className="mr-2 h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Remaining Balance</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Last Payment</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {creditAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className="h-8 w-8 rounded-full bg-[#2D6BFF]/10 flex items-center justify-center cursor-pointer"
                        onClick={() => handleViewPaymentHistory(account)}
                      >
                        <User className="h-4 w-4 text-[#2D6BFF]" />
                      </div>
                      <div
                        className="ml-3 cursor-pointer"
                        onClick={() => handleViewPaymentHistory(account)}
                      >
                        <div className="text-sm font-medium text-gray-900">{account.fullName}</div>
                        <div className="text-xs text-gray-500">#{account.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${(account.totalAmount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${(account.remainingBalance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {account.paymentFrequency} - ${(account.paymentAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {account.payments && account.payments.length > 0
                      ? new Date(account.payments[account.payments.length - 1].date).toLocaleDateString()
                      : 'No payments'}
                  </td>
                  <td className="px-6 py-4 flex space-x-4">
                    <button
                      onClick={() => {
                        setSelectedCustomer(account)
                        setShowPaymentForm(true)
                      }}
                      className="text-[#2D6BFF] hover:text-[#2D6BFF]/90 text-sm font-medium"
                    >
                      Record Payment
                    </button>
                    <button
                      onClick={() => handleViewPaymentHistory(account)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Application Form Modal */}
      {showCreditApplicationForm && (
        <CreditApplicationForm
          onClose={() => setShowCreditApplicationForm(false)}
          isSubmitting={isSubmitting}
          onSubmit={async (application) => {
            try {
              setIsSubmitting(true);
              console.log('Submitting application:', application)

              const response = await fetch('/api/credit/apply', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(application),
              })

              const responseData = await response.json()
              console.log('Application response:', responseData)

              if (!response.ok) {
                const errorMsg = responseData.error || 'Failed to submit application'
                console.error('Application API error:', errorMsg)
                throw new Error(errorMsg)
              }

              // Add the new account to the local state
              // The API returns the new account directly, not in a nested object
              const normalizedAccount = normalizeCreditAccount(responseData)
              setCreditAccounts((prevAccounts) => [normalizedAccount, ...prevAccounts])

              setShowCreditApplicationForm(false)
            } catch (error) {
              console.error('Error submitting application:', error)
              alert(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`)
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedCustomer && (
        <PaymentForm
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.fullName}
          remainingBalance={selectedCustomer.remainingBalance}
          customer={selectedCustomer}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedCustomer(null)
          }}
          isSubmitting={isSubmitting}
          onSubmit={async (payment) => {
            try {
              setIsSubmitting(true);
              console.log('Submitting payment:', payment)
              console.log('For customer:', selectedCustomer.id)

              const response = await fetch('/api/credit/record-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  accountId: selectedCustomer.id,
                  payment,
                }),
              })

              const responseData = await response.json()
              console.log('Payment response:', responseData)

              if (!response.ok) {
                const errorMsg = responseData.error || 'Failed to record payment'
                console.error('Payment API error:', errorMsg)
                throw new Error(errorMsg)
              }

              if (responseData.updatedAccount) {
                // Normalize the updated account data
                const normalizedAccount = normalizeCreditAccount(responseData.updatedAccount)

                // Update the local state with the normalized data from the server
                setCreditAccounts((prevAccounts) =>
                  prevAccounts.map((account) =>
                    account.id === selectedCustomer.id ? normalizedAccount : account
                  )
                )
              } else {
                // Fallback to client-side update if server doesn't return updated account
                setCreditAccounts((prevAccounts) =>
                  prevAccounts.map((account) =>
                    account.id === selectedCustomer.id
                      ? {
                        ...account,
                        payments: [...account.payments, payment],
                        remainingBalance: account.remainingBalance - payment.amount,
                      }
                      : account
                  )
                )
              }

              // No longer closing the form here - will be closed after printing receipt
              // setShowPaymentForm(false)
              // setSelectedCustomer(null)
            } catch (error) {
              console.error('Error recording payment:', error)
              alert(`Failed to record payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
              setShowPaymentForm(false)
              setSelectedCustomer(null)
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && selectedCustomer && (
        <PaymentHistoryModal
          customer={selectedCustomer}
          onClose={() => {
            setShowPaymentHistory(false)
            setSelectedCustomer(null)
          }}
        />
      )}
    </div>
  )
} 