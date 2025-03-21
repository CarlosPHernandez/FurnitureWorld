'use client'

import { useState } from 'react'
import { X, Plus, Minus, DollarSign } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

type PaymentMethod = 'cash' | 'check' | 'debit' | 'credit'
type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly'

interface CreditApplicationFormProps {
  onClose: () => void
  onSubmit: (formData: {
    fullName: string
    address: string
    phoneNumber: string
    dateOfBirth: string
    taxId: string
    driversLicense: string
    paymentMethod: PaymentMethod
    cardName?: string
    cardNumber?: string
    paymentFrequency: PaymentFrequency
    paymentAmount: number
    itemsFinanced: Array<{
      name: string
      price: number
    }>
  }) => void
  isSubmitting?: boolean
  errorMessage?: string | null
}

export default function CreditApplicationForm({
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null
}: CreditApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    dateOfBirth: '',
    taxId: '',
    driversLicense: '',
    paymentMethod: 'cash' as PaymentMethod,
    cardName: '',
    cardNumber: '',
    paymentFrequency: 'monthly' as PaymentFrequency,
    paymentAmount: 0,
    itemsFinanced: [{ name: '', price: 0 }],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddItem = () => {
    setFormData({
      ...formData,
      itemsFinanced: [...formData.itemsFinanced, { name: '', price: 0 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    if (formData.itemsFinanced.length === 1) return
    const newItems = formData.itemsFinanced.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      itemsFinanced: newItems
    })
  }

  const calculateTotal = () => {
    return formData.itemsFinanced.reduce((total, item) => total + item.price, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required'

    // Validate items
    const hasInvalidItems = formData.itemsFinanced.some(item => !item.name.trim() || item.price <= 0)
    if (hasInvalidItems) newErrors.items = 'All items must have a name and price greater than 0'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Calculate payment amount if not set
    let submissionData = { ...formData }
    if (submissionData.paymentAmount <= 0) {
      const total = calculateTotal()
      let paymentAmount: number

      if (submissionData.paymentFrequency === 'weekly') {
        paymentAmount = total / 52
      } else if (submissionData.paymentFrequency === 'biweekly') {
        paymentAmount = total / 26
      } else {
        paymentAmount = total / 12
      }

      submissionData.paymentAmount = Math.ceil(paymentAmount * 100) / 100 // Round up to nearest cent
    }

    onSubmit(submissionData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-auto my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">New Credit Application</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-3 py-2 text-sm border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent`}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full px-3 py-2 text-sm border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent`}
              />
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-3 py-2 text-sm border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent`}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={`w-full px-3 py-2 text-sm border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID (SSN)</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License</label>
              <input
                type="text"
                value={formData.driversLicense}
                onChange={(e) => setFormData({ ...formData, driversLicense: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-3">Payment Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentMethod: e.target.value as PaymentMethod
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="debit">Debit Card</option>
                  <option value="credit">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentFrequency: e.target.value as PaymentFrequency
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {(formData.paymentMethod === 'credit' || formData.paymentMethod === 'debit') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (Optional)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paymentAmount || ''}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="Auto-calculated if left empty"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  If left empty, payment will be calculated based on frequency
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-gray-800">Items Financed</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center text-sm text-[#2D6BFF]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            {errors.items && <p className="mb-2 text-xs text-red-500">{errors.items}</p>}

            <div className="space-y-3">
              {formData.itemsFinanced.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...formData.itemsFinanced]
                        newItems[index].name = e.target.value
                        setFormData({ ...formData, itemsFinanced: newItems })
                      }}
                      placeholder="Item name"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                    />
                  </div>

                  <div className="w-32">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={item.price || ''}
                        onChange={(e) => {
                          const newItems = [...formData.itemsFinanced]
                          newItems[index].price = parseFloat(e.target.value) || 0
                          setFormData({ ...formData, itemsFinanced: newItems })
                        }}
                        placeholder="Price"
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={formData.itemsFinanced.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <p className="text-sm font-medium text-gray-700">
                Total: <span className="text-[#1A1A1A]">${calculateTotal().toFixed(2)}</span>
              </p>
            </div>
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
                  <LoadingSpinner size="sm" text="" icon="bed" className="mr-2" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 