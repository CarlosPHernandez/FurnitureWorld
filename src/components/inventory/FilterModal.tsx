import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    category: string
    priceRange: number[]
    stockStatus: string
  }
  onApplyFilters: (filters: {
    category: string
    priceRange: number[]
    stockStatus: string
  }) => void
  categories: string[]
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  categories
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Inventory</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={localFilters.category}
              onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Price Range</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.priceRange[0] || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  priceRange: [Number(e.target.value), localFilters.priceRange[1] || Infinity]
                })}
                className="w-full p-2 border rounded-md"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.priceRange[1] || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  priceRange: [localFilters.priceRange[0] || 0, Number(e.target.value)]
                })}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
          </div>

          {/* Stock Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Stock Status</label>
            <select
              value={localFilters.stockStatus}
              onChange={(e) => setLocalFilters({ ...localFilters, stockStatus: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Low Stock</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 