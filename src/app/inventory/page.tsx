'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import AddItemModal from '@/components/inventory/AddItemModal'
import FilterModal from '@/components/inventory/FilterModal'
import { InventoryItem } from '@/types/inventory'
import { 
  ChevronRight,
  ArrowUpDown,
  X,
} from 'lucide-react'

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
  priceRange: number[]
  stockStatus: string
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [] as number[],
    stockStatus: 'all'
  })

  // Example inventory data with complete details
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      sku: 'SOFA-001',
      name: '3-Seater Sofa',
      category: 'Living Room',
      quantity: 5,
      minQuantity: 3,
      price: 899.99,
      cost: 450.00,
      lastUpdated: '2024-02-22',
      imageUrl: '/download.jpg',
      dimensions: {
        length: 220,
        width: 85,
        height: 70,
        unit: 'cm'
      },
      weight: 45,
      weightUnit: 'kg',
      materials: ['Polyester', 'Pine Wood', 'High-Density Foam'],
      finish: 'Matte',
      color: 'Charcoal Gray',
      assemblyRequired: true,
      assemblyTime: 45,
      warranty: {
        duration: 24,
        coverage: 'Frame and springs warranty'
      },
      supplier: {
        id: 'SUP001',
        name: 'Luxury Furniture Co.',
        leadTime: 14,
        minimumOrder: 2,
        priceBreaks: [
          { quantity: 5, price: 425.00 },
          { quantity: 10, price: 400.00 }
        ],
        rating: 4.8
      },
      location: {
        warehouse: 'MAIN',
        aisle: 'A12',
        shelf: 'S3'
      },
      status: 'active',
      tags: ['comfortable', 'modern', 'family'],
      notes: 'Best-selling model, consider increasing stock before holiday season',
      qualityControl: {
        lastInspection: '2024-02-20',
        inspector: 'John Smith',
        status: 'passed'
      },
      customization: {
        available: true,
        options: [
          {
            type: 'Fabric',
            choices: ['Velvet', 'Linen', 'Leather'],
            priceModifier: 200
          },
          {
            type: 'Leg Finish',
            choices: ['Natural', 'Walnut', 'Black'],
            priceModifier: 50
          }
        ]
      }
    },
    {
      id: '2',
      sku: 'BED-001',
      name: 'Queen Size Bed',
      category: 'Bedroom',
      quantity: 2,
      minQuantity: 2,
      price: 699.99,
      cost: 350.00,
      lastUpdated: '2024-02-22',
      imageUrl: '/download.jpg',
      dimensions: {
        length: 200,
        width: 160,
        height: 120,
        unit: 'cm'
      },
      weight: 85,
      weightUnit: 'kg',
      materials: ['Oak Wood', 'Steel', 'Premium Fabric'],
      finish: 'Semi-Gloss',
      color: 'Natural Oak',
      assemblyRequired: true,
      assemblyTime: 90,
      warranty: {
        duration: 36,
        coverage: 'Frame and structural components'
      },
      supplier: {
        id: 'SUP002',
        name: 'Premium Beds Manufacturing',
        leadTime: 21,
        minimumOrder: 1,
        priceBreaks: [
          { quantity: 3, price: 325.00 },
          { quantity: 5, price: 300.00 }
        ],
        rating: 4.9
      },
      location: {
        warehouse: 'MAIN',
        aisle: 'B03',
        shelf: 'S1'
      },
      status: 'active',
      tags: ['premium', 'durable', 'classic'],
      notes: 'Premium model with consistent sales',
      qualityControl: {
        lastInspection: '2024-02-21',
        inspector: 'Sarah Johnson',
        status: 'passed'
      },
      customization: {
        available: true,
        options: [
          {
            type: 'Headboard Style',
            choices: ['Classic', 'Modern', 'Minimalist'],
            priceModifier: 150
          },
          {
            type: 'Wood Finish',
            choices: ['Light Oak', 'Dark Oak', 'Walnut'],
            priceModifier: 75
          }
        ]
      }
    }
  ])

  const handleAddItem = (newItem: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const item: InventoryItem = {
      ...newItem,
      id: (inventory.length + 1).toString(),
      lastUpdated: new Date().toISOString()
    }
    setInventory([...inventory, item])
    setIsAddItemModalOpen(false)
  }

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id))
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filters.category === 'all' || item.category === filters.category
    const matchesPriceRange = filters.priceRange.length === 0 ||
      (item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1])
    const matchesStockStatus = filters.stockStatus === 'all' ||
      (filters.stockStatus === 'low' && item.quantity <= item.minQuantity) ||
      (filters.stockStatus === 'in-stock' && item.quantity > item.minQuantity)

    return matchesSearch && matchesCategory && matchesPriceRange && matchesStockStatus
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Inventory Management</h1>
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
              placeholder="Search by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
            />
          </div>
        </div>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className={`flex items-center px-4 py-2 text-sm ${
            Object.values(filters).some(value => 
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Item</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Last Updated</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <span className="font-medium text-[#1A1A1A]">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{item.sku}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{item.category}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${
                        item.quantity <= item.minQuantity ? 'text-[#FF3B30]' : 'text-gray-600'
                      }`}>
                        {item.quantity}
                      </span>
                      {item.quantity <= item.minQuantity && (
                        <AlertCircle className="h-4 w-4 text-[#FF3B30]" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-[#FF3B30]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
        onApplyFilters={setFilters}
        categories={Array.from(new Set(inventory.map(item => item.category)))}
      />
    </div>
  )
} 