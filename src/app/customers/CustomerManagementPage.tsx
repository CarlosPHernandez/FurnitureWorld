'use client'

import { useState } from 'react'
import {
  ChevronRight,
  Plus,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { Customer, CustomerInput } from '@/services/customers'

interface CustomerManagementPageProps {
  initialCustomers: Customer[]
}

export default function CustomerManagementPage({ initialCustomers }: CustomerManagementPageProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    })
    setFormError(null)
  }

  const handleAddCustomer = async () => {
    try {
      setIsSubmitting(true)
      setFormError(null)

      // Validate form
      if (!formData.name.trim()) {
        setFormError('Customer name is required')
        return
      }

      if (!formData.phone.trim()) {
        setFormError('Phone number is required')
        return
      }

      // Trim input values
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes?.trim(),
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add customer')
      }

      const newCustomer = await response.json()
      setCustomers([newCustomer, ...customers])
      setShowAddCustomer(false)
      resetForm()
    } catch (err: any) {
      setFormError(err.message || 'Failed to add customer')
      console.error('Error adding customer:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCustomer = async (id: string) => {
    try {
      setIsSubmitting(true)
      setFormError(null)

      // Validate form
      if (!formData.name.trim()) {
        setFormError('Customer name is required')
        return
      }

      if (!formData.phone.trim()) {
        setFormError('Phone number is required')
        return
      }

      // Trim input values
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes?.trim(),
      }

      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }

      const updatedCustomer = await response.json()
      setCustomers(customers.map(c => c.id === id ? updatedCustomer : c))
      setEditingCustomerId(null)
      resetForm()
    } catch (err: any) {
      setFormError(err.message || 'Failed to update customer')
      console.error('Error updating customer:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete customer')
      }

      setCustomers(customers.filter(c => c.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer')
      console.error('Error deleting customer:', err)
    }
  }

  const startEditing = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes || '',
    })
    setEditingCustomerId(customer.id)
  }

  const cancelEditing = () => {
    setEditingCustomerId(null)
    resetForm()
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white rounded-xl p-3 md:p-4 shadow-sm">
        <div className="flex items-center text-sm text-gray-500">
          <span className="hover:text-gray-700 transition-colors">Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-[#2D6BFF] font-medium">Customer Management</span>
        </div>
        <button
          onClick={() => {
            setShowAddCustomer(true)
            resetForm()
          }}
          className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200 shadow-sm shadow-[#2D6BFF]/25"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Add Customer Form */}
      {showAddCustomer && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Add New Customer</h2>
            <button
              onClick={() => {
                setShowAddCustomer(false)
                resetForm()
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setFormError(null)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setFormError(null)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  setFormError(null)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value })
                  setFormError(null)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value })
              }}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
              placeholder="Add any additional notes about this customer"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddCustomer(false)
                resetForm()
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              className="px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Customer'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Customers ({filteredCustomers.length})
        </h2>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new customer'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowAddCustomer(true)
                    resetForm()
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200 shadow-sm shadow-[#2D6BFF]/25"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Customer
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    {editingCustomerId === customer.id ? (
                      // Editing mode
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                              />
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          {formError && (
                            <div className="text-xs text-red-600 mb-2">{formError}</div>
                          )}
                          <button
                            onClick={() => handleUpdateCustomer(customer.id)}
                            className="text-[#2D6BFF] hover:text-[#2D6BFF]/80 transition-colors"
                            disabled={isSubmitting}
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            disabled={isSubmitting}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.address && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{customer.address}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {customer.notes || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => startEditing(customer)}
                            className="text-[#2D6BFF] hover:text-[#2D6BFF]/80 transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 