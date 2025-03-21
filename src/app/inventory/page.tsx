'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  Filter,
  Plus,
  Package,
  AlertCircle,
  Edit,
  Trash2,
  DollarSign,
  ChevronRight,
  Tag,
  X,
} from 'lucide-react'
import AddItemModal from '@/components/inventory/AddItemModal'
import FilterModal from '@/components/inventory/FilterModal'
import ItemDetailModal from '@/components/inventory/ItemDetailModal'
import EditItemModal from '@/components/inventory/EditItemModal'
import { InventoryItem } from '@/types/inventory'
import {
  ArrowUpDown,
} from 'lucide-react'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { LoadingScreen } from '@/components/ui/loading-spinner'

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

interface Supplier {
  id: string;
  name: string;
  leadTime: number; // in days
  minimumOrder: number;
  priceBreaks: {
    quantity: number;
    price: number;
  }[];
  rating: number;
}

interface FilterOptions {
  category: string
  brand: string
  priceRange: number[]
  stockStatus: string
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    priceRange: [] as number[],
    stockStatus: 'all'
  })

  // Common furniture brands
  const commonBrands = [
    'Ashley Furniture',
    'Crown Mark',
    'Galaxy Furniture',
    'Homey Design',
    'Coaster Furniture',
    'ACME Furniture',
    'Liberty Furniture',
    'Signature Design',
    'Global Furniture USA',
    'Meridian Furniture'
  ]

  // Get unique categories from inventory
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(inventory.map(item => item.category)))
      .filter(Boolean)
      .sort();
  }, [inventory]);

  // Get unique brands from inventory
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(inventory.map(item => item.brand)))
      .filter(Boolean)
      .sort();
  }, [inventory]);

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      if (filters.category !== 'all') {
        queryParams.append('category', filters.category)
      }

      if (filters.brand !== 'all') {
        queryParams.append('brand', filters.brand)
      }

      if (filters.stockStatus !== 'all') {
        if (filters.stockStatus === 'low') {
          queryParams.append('lowStock', 'true')
        } else {
          queryParams.append('status', filters.stockStatus)
        }
      }

      const response = await fetch(`/api/inventory?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch inventory')
      }

      const data = await response.json()
      setInventory(data)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      // If the table doesn't exist yet, show a more helpful message
      if (err instanceof Error && err.message.includes('relation "inventory_items" does not exist')) {
        setError('The inventory database table has not been created yet. Please run the database migration first.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Initial data fetch
  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleAddItem = async (newItem: Omit<InventoryItem, "id" | "lastUpdated">) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add inventory item')
      }

      // Refresh inventory data
      fetchInventory()
      setIsAddItemModalOpen(false)
    } catch (err) {
      console.error('Error adding inventory item:', err)
      alert(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleEditItem = async (updatedItem: InventoryItem) => {
    try {
      const response = await fetch(`/api/inventory/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update inventory item')
      }

      // Refresh inventory data
      fetchInventory()
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Error updating inventory item:', err)
      alert(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete inventory item')
      }

      // Refresh inventory data
      fetchInventory()
    } catch (err) {
      console.error('Error deleting inventory item:', err)
      alert(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const openDetailModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDetailModalOpen(true)
  }

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  // Filter by category directly
  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category === prev.category ? 'all' : category
    }));
  };

  // Filter by brand directly
  const handleBrandFilter = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brand: brand === prev.brand ? 'all' : brand
    }));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesBrand = filters.brand === 'all' || item.brand === filters.brand;
    const matchesStock = filters.stockStatus === 'all' ||
      (filters.stockStatus === 'low' && item.quantity <= item.minQuantity) ||
      (filters.stockStatus === 'out' && item.quantity === 0);

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  })

  return (
    <DeliveryLayout>
      {isLoading ? (
        <LoadingScreen text="Loading inventory..." icon="table" />
      ) : error ? (
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-[#FF3B30] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Inventory</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchInventory()}
            className="px-4 py-2 bg-[#2D6BFF] text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span>Inventory</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-[#2D6BFF]">Inventory Management</span>
            </div>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, category, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center px-4 py-2 text-sm ${Object.values(filters).some(value =>
                Array.isArray(value) ? value.length > 0 : value !== 'all'
              )
                ? 'text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90'
                : 'text-[#1A1A1A] hover:bg-gray-100'
                } rounded-lg`}
            >
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Category Quick Filters */}
          {uniqueCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center mr-2">
                <Tag className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Categories:</span>
              </div>
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`text-xs px-3 py-1 rounded-full ${filters.category === 'all'
                  ? 'bg-[#2D6BFF] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
              >
                All
              </button>
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`text-xs px-3 py-1 rounded-full ${filters.category === category
                    ? 'bg-[#2D6BFF] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Brand Quick Filters */}
          {uniqueBrands.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center mr-2">
                <Package className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Brands:</span>
              </div>
              <button
                onClick={() => handleBrandFilter('all')}
                className={`text-xs px-3 py-1 rounded-full ${filters.brand === 'all'
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
              >
                All
              </button>
              {uniqueBrands.slice(0, 10).map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandFilter(brand)}
                  className={`text-xs px-3 py-1 rounded-full ${filters.brand === brand
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                >
                  {brand}
                </button>
              ))}
              {uniqueBrands.length > 10 && (
                <span className="text-xs text-gray-500 self-center">
                  +{uniqueBrands.length - 10} more
                </span>
              )}
            </div>
          )}

          {/* Active Filters Display */}
          {(filters.category !== 'all' || filters.brand !== 'all' || filters.stockStatus !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2 rounded-lg">
              <span className="text-sm font-medium text-gray-500 mr-2">Active Filters:</span>
              {filters.category !== 'all' && (
                <div className="flex items-center text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  <span>Category: {filters.category}</span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.brand !== 'all' && (
                <div className="flex items-center text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                  <span>Brand: {filters.brand}</span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, brand: 'all' }))}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.stockStatus !== 'all' && (
                <div className="flex items-center text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
                  <span>Stock: {filters.stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}</span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, stockStatus: 'all' }))}
                    className="ml-1 hover:text-amber-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setFilters({
                  category: 'all',
                  brand: 'all',
                  priceRange: [],
                  stockStatus: 'all'
                })}
                className="text-xs text-gray-500 hover:text-gray-800 underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Package className="h-6 w-6 text-[#2D6BFF]" />
                <span className="text-sm font-medium text-[#2D6BFF]">Total Items</span>
              </div>
              <p className="text-2xl font-bold mt-2">{inventory.length}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="h-6 w-6 text-[#FF3B30]" />
                <span className="text-sm font-medium text-[#FF3B30]">Low Stock Items</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {inventory.filter(item => item.quantity <= item.minQuantity).length}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-6 w-6 text-[#00C48C]" />
                <span className="text-sm font-medium text-[#00C48C]">Total Value</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                ${inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetailModal(item)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-md object-cover" src={item.imageUrl} alt={item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {item.brand}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <span className={item.quantity <= item.minQuantity ? 'text-[#FF3B30]' : ''}>
                              {item.quantity}
                            </span>
                            {item.quantity <= item.minQuantity && (
                              <AlertCircle className="h-4 w-4 text-[#FF3B30] ml-1" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                              className="p-2 text-gray-400 hover:text-[#FF3B30]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        categories={uniqueCategories}
        brands={uniqueBrands.length > 0 ? uniqueBrands : commonBrands}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedItem}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditItem}
        item={selectedItem}
      />
    </DeliveryLayout>
  )
} 