'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: {
    name: string
    sku: string
    category: string
    quantity: number
    minQuantity: number
    price: number
    cost: number
    imageUrl: string
    dimensions: {
      length: number
      width: number
      height: number
      unit: 'cm' | 'in'
    }
    weight: number
    weightUnit: 'kg' | 'lb'
    materials: string[]
    finish: string
    color: string
    assemblyRequired: boolean
    assemblyTime: number
    warranty: {
      duration: number
      coverage: string
    }
    supplier: {
      id: string
      name: string
      leadTime: number
      minimumOrder: number
      priceBreaks: {
        quantity: number
        price: number
      }[]
      rating: number
    }
    location: {
      warehouse: string
      aisle: string
      shelf: string
    }
    status: 'active' | 'discontinued' | 'seasonal'
    season?: 'spring' | 'summer' | 'fall' | 'winter'
    tags: string[]
    notes: string
    qualityControl: {
      lastInspection: string
      inspector: string
      status: 'passed' | 'failed' | 'pending'
      issues?: string[]
    }
    customization: {
      available: boolean
      options?: {
        type: string
        choices: string[]
        priceModifier: number
      }[]
    }
  }) => void
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

export default function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    price: 0,
    cost: 0,
    imageUrl: '/download.jpg',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: 'cm' as const
    },
    weight: 0,
    weightUnit: 'kg' as 'kg' | 'lb',
    materials: [] as string[],
    finish: '',
    color: '',
    assemblyRequired: false,
    assemblyTime: 0,
    warranty: {
      duration: 12,
      coverage: 'Standard warranty'
    },
    supplier: {
      id: '',
      name: '',
      leadTime: 7,
      minimumOrder: 1,
      priceBreaks: [] as { quantity: number; price: number }[],
      rating: 5
    },
    location: {
      warehouse: 'MAIN',
      aisle: '',
      shelf: ''
    },
    status: 'active' as 'active' | 'discontinued' | 'seasonal',
    tags: [] as string[],
    notes: '',
    qualityControl: {
      lastInspection: new Date().toISOString().split('T')[0],
      inspector: '',
      status: 'pending' as 'passed' | 'failed' | 'pending'
    },
    customization: {
      available: false,
      options: [] as { type: string; choices: string[]; priceModifier: number }[]
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
      price: 0,
      cost: 0,
      imageUrl: '/download.jpg',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      },
      weight: 0,
      weightUnit: 'kg',
      materials: [],
      finish: '',
      color: '',
      assemblyRequired: false,
      assemblyTime: 0,
      warranty: {
        duration: 12,
        coverage: 'Standard warranty'
      },
      supplier: {
        id: '',
        name: '',
        leadTime: 7,
        minimumOrder: 1,
        priceBreaks: [],
        rating: 5
      },
      location: {
        warehouse: 'MAIN',
        aisle: '',
        shelf: ''
      },
      status: 'active',
      tags: [],
      notes: '',
      qualityControl: {
        lastInspection: new Date().toISOString().split('T')[0],
        inspector: '',
        status: 'pending'
      },
      customization: {
        available: false,
        options: []
      }
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'discontinued' | 'seasonal' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing and Quantity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing and Quantity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost ($)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Quantity</label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dimensions and Weight */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dimensions and Weight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Length</label>
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: { ...formData.dimensions, length: Number(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: { ...formData.dimensions, width: Number(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: { ...formData.dimensions, height: Number(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value as 'kg' | 'lb' })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Materials and Finish */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Materials and Finish</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Materials</label>
                <input
                  type="text"
                  value={formData.materials.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    materials: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter materials separated by commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Finish</label>
                <input
                  type="text"
                  value={formData.finish}
                  onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Assembly and Warranty */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Assembly and Warranty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.assemblyRequired}
                  onChange={(e) => setFormData({ ...formData, assemblyRequired: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Assembly Required</label>
              </div>
              {formData.assemblyRequired && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assembly Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.assemblyTime}
                    onChange={(e) => setFormData({ ...formData, assemblyTime: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                    min="0"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Warranty Duration (months)</label>
                <input
                  type="number"
                  value={formData.warranty.duration}
                  onChange={(e) => setFormData({
                    ...formData,
                    warranty: { ...formData.warranty, duration: Number(e.target.value) }
                  })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Warranty Coverage</label>
                <input
                  type="text"
                  value={formData.warranty.coverage}
                  onChange={(e) => setFormData({
                    ...formData,
                    warranty: { ...formData.warranty, coverage: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Warehouse</label>
                <input
                  type="text"
                  value={formData.location.warehouse}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, warehouse: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aisle</label>
                <input
                  type="text"
                  value={formData.location.aisle}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, aisle: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shelf</label>
                <input
                  type="text"
                  value={formData.location.shelf}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, shelf: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Quality Control */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quality Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Inspector</label>
                <input
                  type="text"
                  value={formData.qualityControl.inspector}
                  onChange={(e) => setFormData({
                    ...formData,
                    qualityControl: { ...formData.qualityControl, inspector: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.qualityControl.status}
                  onChange={(e) => setFormData({
                    ...formData,
                    qualityControl: {
                      ...formData.qualityControl,
                      status: e.target.value as 'passed' | 'failed' | 'pending'
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.customization.available}
                onChange={(e) => setFormData({
                  ...formData,
                  customization: { ...formData.customization, available: e.target.checked }
                })}
                className="mr-2"
              />
              <label className="text-sm font-medium">Customization Available</label>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 