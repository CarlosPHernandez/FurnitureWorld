'use client'

import { useState, useEffect, useRef } from 'react'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import {
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Package,
  MapPin,
  Clock,
  Truck,
  Check,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { Autocomplete } from '@react-google-maps/api'
import { useGoogleMaps } from '@/contexts/GoogleMapsContext'
import { LoadingScreen } from '@/components/ui/loading-spinner'

interface Delivery {
  id: string;
  address: string;
  customer: string;
  items: string[];
  delivery_date: string;
  time_slot: string;
  driver: string;
  status: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const TIME_SLOTS = [
  { label: '9:00 AM - 12:00 PM', value: 'morning' },
  { label: '12:00 PM - 3:00 PM', value: 'early_afternoon' },
  { label: '3:00 PM - 6:00 PM', value: 'late_afternoon' }
]

const libraries = ['places']

export default function Deliveries() {
  const [isAddingDelivery, setIsAddingDelivery] = useState(false)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [newDelivery, setNewDelivery] = useState({
    address: '',
    customer: '',
    items: [''],
    delivery_date: '',
    time_slot: '',
    driver: '',
    coordinates: null as { lat: number; lng: number } | null,
  })
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [addressError, setAddressError] = useState('')
  const { isLoaded } = useGoogleMaps();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/deliveries')
      if (!response.ok) throw new Error('Failed to fetch deliveries')
      const data = await response.json()
      setDeliveries(data)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDelivery),
      })

      if (!response.ok) throw new Error('Failed to add delivery')

      // Reset form and fetch updated deliveries
      setIsAddingDelivery(false)
      setNewDelivery({
        address: '',
        customer: '',
        items: [''],
        delivery_date: '',
        time_slot: '',
        driver: '',
        coordinates: null,
      })
      fetchDeliveries()
    } catch (error) {
      console.error('Error adding delivery:', error)
    }
  }

  const handleMarkAsDone = async (id: string) => {
    setIsUpdating(true)
    setActionError(null)
    try {
      const response = await fetch(`/api/deliveries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Completed' }),
      })

      if (!response.ok) throw new Error('Failed to update delivery status')

      // Update the local state
      setDeliveries(deliveries.map(delivery =>
        delivery.id === id
          ? { ...delivery, status: 'Completed' }
          : delivery
      ))
      setActiveDropdown(null)
    } catch (error) {
      console.error('Error updating delivery:', error)
      setActionError('Failed to mark delivery as done. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteDelivery = async (id: string) => {
    setIsUpdating(true)
    setActionError(null)
    try {
      const response = await fetch(`/api/deliveries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete delivery')

      // Remove from local state
      setDeliveries(deliveries.filter(delivery => delivery.id !== id))
      setShowConfirmDelete(null)
    } catch (error) {
      console.error('Error deleting delivery:', error)
      setActionError('Failed to delete delivery. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddItem = () => {
    setNewDelivery(prev => ({
      ...prev,
      items: [...prev.items, '']
    }))
  }

  const handleRemoveItem = (index: number) => {
    setNewDelivery(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, value: string) => {
    setNewDelivery(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }))
  }

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  const handlePlaceSelect = () => {
    try {
      const place = autocompleteRef.current?.getPlace()

      if (!place) {
        setAddressError('Please select an address from the dropdown')
        return
      }

      if (!place.geometry || !place.geometry.location) {
        setAddressError('Invalid address selected')
        return
      }

      const location = place.geometry.location
      setAddressError('')
      setNewDelivery(prev => ({
        ...prev,
        address: place.formatted_address || prev.address,
        coordinates: {
          lat: location.lat(),
          lng: location.lng()
        }
      }))
    } catch (error) {
      console.error('Error selecting place:', error)
      setAddressError('Error selecting address')
    }
  }

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDelivery(prev => ({ ...prev, address: e.target.value }))
    // Clear coordinates when user starts typing new address
    if (newDelivery.coordinates) {
      setNewDelivery(prev => ({ ...prev, coordinates: null }))
    }
    setAddressError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDelivery.coordinates) {
      setAddressError('Please select a valid address from the dropdown')
      return
    }

    try {
      await handleAddDelivery(e)
    } catch (error) {
      console.error('Error submitting delivery:', error)
    }
  }

  return (
    <DeliveryLayout>
      {isLoading ? (
        <LoadingScreen text="Loading deliveries..." icon="sofa" />
      ) : (
        <div className="p-4 md:p-6 space-y-6">
          {/* Breadcrumb and Add Delivery Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center text-sm text-gray-500">
              <span className="hover:text-gray-700 transition-colors">Dashboard</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-[#2D6BFF] font-medium">Furniture Deliveries</span>
            </div>
            <button
              onClick={() => setIsAddingDelivery(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#2D6BFF] text-white rounded-lg hover:bg-[#2D6BFF]/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Delivery</span>
            </button>
          </div>

          {/* Error Message (if any) */}
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{actionError}</p>
            </div>
          )}

          {/* Add Delivery Form */}
          {isAddingDelivery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Add New Delivery</h2>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={newDelivery.customer}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, customer: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    {!isLoaded ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        Loading address search...
                      </div>
                    ) : (
                      <Autocomplete
                        onLoad={autocomplete => {
                          autocompleteRef.current = autocomplete
                        }}
                        onPlaceChanged={handlePlaceSelect}
                        restrictions={{ country: 'us' }}
                      >
                        <input
                          type="text"
                          value={newDelivery.address}
                          onChange={handleAddressInputChange}
                          className={`w-full px-3 py-2 border ${addressError ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]`}
                          placeholder="Start typing an address..."
                          required
                        />
                      </Autocomplete>
                    )}
                    {addressError && (
                      <p className="mt-1 text-sm text-red-500">{addressError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={newDelivery.delivery_date}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, delivery_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot
                    </label>
                    <select
                      value={newDelivery.time_slot}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, time_slot: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]"
                      required
                    >
                      <option value="">Select a time slot</option>
                      {TIME_SLOTS.map(slot => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver
                    </label>
                    <input
                      type="text"
                      value={newDelivery.driver}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, driver: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Items
                    </label>
                    {newDelivery.items.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]"
                          placeholder="Item description"
                          required
                        />
                        {newDelivery.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-sm text-[#2D6BFF] hover:text-[#2D6BFF]/90"
                    >
                      + Add another item
                    </button>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsAddingDelivery(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
                    >
                      Add Delivery
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                />
              </div>
            </div>
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Deliveries Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#2D6BFF] font-medium">{delivery.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{delivery.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{delivery.address}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{delivery.items.join(', ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{delivery.delivery_date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {TIME_SLOTS.find(slot => slot.value === delivery.time_slot)?.label || delivery.time_slot}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{delivery.driver}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${delivery.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                          }`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 relative">
                        <div ref={activeDropdown === delivery.id ? dropdownRef : null}>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => toggleDropdown(delivery.id)}
                            disabled={isUpdating}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {activeDropdown === delivery.id && (
                            <div className="absolute right-6 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                              {delivery.status !== 'Completed' && (
                                <button
                                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleMarkAsDone(delivery.id)}
                                  disabled={isUpdating}
                                >
                                  <Check className="h-4 w-4 mr-2 text-green-500" />
                                  Mark as Done
                                </button>
                              )}
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                onClick={() => setShowConfirmDelete(delivery.id)}
                                disabled={isUpdating}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}

                          {showConfirmDelete === delivery.id && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                  Are you sure you want to delete this delivery? This action cannot be undone.
                                </p>
                                <div className="mt-4 flex justify-end space-x-3">
                                  <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    onClick={() => setShowConfirmDelete(null)}
                                    disabled={isUpdating}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                                    onClick={() => handleDeleteDelivery(delivery.id)}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DeliveryLayout>
  )
} 