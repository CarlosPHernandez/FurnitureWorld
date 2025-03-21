'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Search, Package, Loader2 } from 'lucide-react'
import type { InventoryItem } from '@/types/inventory'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  inventoryId?: string | undefined
  sku?: string | undefined
}

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (invoice: {
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    date: string
    dueDate: string
    items: LineItem[]
    subtotal: number
    tax: number
    total: number
  }) => void
}

export default function CreateInvoiceModal({ isOpen, onClose, onAdd }: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0, inventoryId: undefined, sku: undefined }] as LineItem[],
    taxRate: 6.75, // Default tax rate of 6.75%
  })

  // Inventory related state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)

  // Fetch inventory items
  const fetchInventory = useCallback(async () => {
    try {
      setLoadingInventory(true)
      const response = await fetch('/api/inventory')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch inventory')
      }

      const data = await response.json()
      setInventoryItems(data)
      setLoadingInventory(false)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setLoadingInventory(false)
    }
  }, [])

  // Load inventory data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventory()
    }
  }, [isOpen, fetchInventory])

  // Filter inventory items when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(inventoryItems)
    } else {
      const lowerQuery = searchQuery.toLowerCase()
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.sku.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.brand.toLowerCase().includes(lowerQuery)
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, inventoryItems])

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const tax = (subtotal * formData.taxRate) / 100
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...formData.items]
    const item = { ...newItems[index] }

    if (field === 'quantity' || field === 'unitPrice') {
      item[field] = typeof value === 'string' ? Number(value) : value
      item.total = item.quantity * item.unitPrice
    } else if (field === 'description') {
      item[field] = String(value)
    } else if (field === 'total') {
      item[field] = typeof value === 'string' ? Number(value) : value
    }

    newItems[index] = item
    setFormData({ ...formData, items: newItems })
  }

  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0, inventoryId: undefined, sku: undefined } as LineItem]
    })
  }

  const removeLineItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const openInventorySelector = (index: number) => {
    setCurrentItemIndex(index)
    setSearchQuery('')
    setFilteredItems(inventoryItems)
    setShowInventoryModal(true)
  }

  const selectInventoryItem = (item: InventoryItem) => {
    if (currentItemIndex === null) return

    const newItems = [...formData.items]
    newItems[currentItemIndex] = {
      description: item.name,
      quantity: 1,
      unitPrice: item.price,
      total: item.price,
      inventoryId: item.id,
      sku: item.sku
    }

    setFormData({ ...formData, items: newItems })
    setShowInventoryModal(false)
    setCurrentItemIndex(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure customer name is not empty
    const customerNameInput = formData.customerName.trim();
    const finalCustomerName = customerNameInput || 'Customer';

    const { subtotal, tax, total } = calculateTotals()
    onAdd({
      customerName: finalCustomerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      date: formData.date,
      dueDate: formData.dueDate,
      items: formData.items,
      subtotal,
      tax,
      total
    })
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0, inventoryId: undefined, sku: undefined }] as LineItem[],
      taxRate: 6.75,
    })
    onClose()
  }

  if (!isOpen) return null

  const { subtotal, tax, total } = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-[#2D6BFF] hover:text-[#2D6BFF]/90 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="flex">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                            placeholder="Type description or select from inventory"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => openInventorySelector(index)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-200 rounded-r-lg"
                            title="Select from inventory"
                          >
                            <Package className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                        {item.sku && (
                          <div className="mt-1 text-xs text-gray-500">
                            SKU: {item.sku}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax Rate:</span>
                  <div className="flex items-center">
                    <select
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                    >
                      <option value="0">No Tax (0%)</option>
                      <option value="6.75">Sales Tax (6.75%)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </div>

      {/* Inventory Item Selector Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Inventory Item</h3>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, SKU, category, or brand"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingInventory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-[#2D6BFF] animate-spin" />
                  <span className="ml-2 text-gray-600">Loading inventory items...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No items match your search' : 'No inventory items available'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectInventoryItem(item)}
                      className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="h-12 w-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center mr-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-10 w-10 object-contain" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="flex text-sm text-gray-500 mt-1">
                          <span className="mr-3">SKU: {item.sku}</span>
                          <span className="mr-3">Price: ${item.price.toFixed(2)}</span>
                          <span>Available: {item.quantity}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 