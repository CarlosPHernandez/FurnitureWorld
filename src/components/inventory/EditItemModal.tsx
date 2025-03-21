'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InventoryItem } from '@/types/inventory'

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: any) => void
  item: InventoryItem | null
}

const categories = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Office',
  'Outdoor',
  'Kitchen',
  'Bathroom',
  'Kids',
  'Storage',
  'Decor'
]

export default function EditItemModal({ isOpen, onClose, onSave, item }: EditItemModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when the item changes
  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        // Ensure we don't have undefined values that could break the form
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || '',
        brand: item.brand || '',
        quantity: item.quantity || 0,
        minQuantity: item.minQuantity || 0,
        price: item.price || 0,
        cost: item.cost || 0,
        imageUrl: item.imageUrl || '/download.jpg',
      })
    }
  }, [item])

  // Reset errors when the modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({})
    }
  }, [isOpen])

  if (!item) return null

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleDimensionsChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' }),
        [dimension]: value
      }
    }))
  }

  const handleDimensionUnitChange = (unit: 'cm' | 'in') => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' }),
        unit
      }
    }))
  }

  const handleSupplierChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      supplier: {
        ...(prev.supplier || { id: '', name: '', leadTime: 0, minimumOrder: 0, priceBreaks: [], rating: 0 }),
        [field]: value
      }
    }))
  }

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...(prev.location || { warehouse: 'MAIN', aisle: '', shelf: '' }),
        [field]: value
      }
    }))
  }

  const handleWarrantyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      warranty: {
        ...(prev.warranty || { duration: 0, coverage: '' }),
        [field]: value
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: Record<string, string> = {}
    const requiredFields = ['sku', 'name', 'category', 'brand', 'price', 'cost']

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Format the data for submission
    const itemToUpdate = {
      ...formData,
      id: item.id, // Ensure we keep the original ID
    }

    onSave(itemToUpdate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item: {item.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU*</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errors.sku ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand*</label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errors.brand ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>

              {formData.status === 'seasonal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                  <select
                    value={formData.season || ''}
                    onChange={(e) => handleChange('season', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost || ''}
                  onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                  className={`w-full p-2 border rounded-md ${errors.cost ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cost && <p className="mt-1 text-xs text-red-500">{errors.cost}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity || 0}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minQuantity || 0}
                  onChange={(e) => handleChange('minQuantity', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Dimensions and Physical Properties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dimensions & Physical Properties</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dimensions?.length || 0}
                  onChange={(e) => handleDimensionsChange('length', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dimensions?.width || 0}
                  onChange={(e) => handleDimensionsChange('width', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dimensions?.height || 0}
                  onChange={(e) => handleDimensionsChange('height', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.dimensions?.unit || 'cm'}
                  onChange={(e) => handleDimensionUnitChange(e.target.value as 'cm' | 'in')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight || 0}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight Unit</label>
                <select
                  value={formData.weightUnit || 'kg'}
                  onChange={(e) => handleChange('weightUnit', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                <input
                  type="text"
                  value={formData.materials ? formData.materials.join(', ') : ''}
                  onChange={(e) => handleChange('materials', e.target.value.split(',').map(m => m.trim()))}
                  placeholder="wood, metal, etc."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Finish</label>
                <input
                  type="text"
                  value={formData.finish || ''}
                  onChange={(e) => handleChange('finish', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Storage Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Storage Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <input
                  type="text"
                  value={formData.location?.warehouse || 'MAIN'}
                  onChange={(e) => handleLocationChange('warehouse', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aisle</label>
                <input
                  type="text"
                  value={formData.location?.aisle || ''}
                  onChange={(e) => handleLocationChange('aisle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                <input
                  type="text"
                  value={formData.location?.shelf || ''}
                  onChange={(e) => handleLocationChange('shelf', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Notes and Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags ? formData.tags.join(', ') : ''}
                  onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="premium, sale, etc."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 