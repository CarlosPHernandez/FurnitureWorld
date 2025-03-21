'use client'

import {
  Package,
  Tag,
  Ruler as RulerIcon,
  Scale as ScaleIcon,
  Paintbrush,
  Wrench,
  ShieldCheck,
  Building2,
  MapPin,
  AlertTriangle,
  Info,
  Edit
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InventoryItem } from '@/types/inventory'

interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
  onEdit: (item: InventoryItem) => void
}

export default function ItemDetailModal({ isOpen, onClose, item, onEdit }: ItemDetailModalProps) {
  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(item)}
              className="ml-auto"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Item</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Basic Info and Image */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Info className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Basic Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">SKU</span>
                  <span className="text-sm font-medium">{item.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Brand</span>
                  <span className="text-sm font-medium">{item.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">{item.status}</span>
                </div>
                {item.season && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Season</span>
                    <span className="text-sm font-medium">{item.season}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-60 object-contain"
              />
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Tag className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Pricing
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Retail Price</span>
                  <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Cost</span>
                  <span className="text-sm font-medium">${item.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Margin</span>
                  <span className="text-sm font-medium">
                    {(((item.price - item.cost) / item.price) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Package className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Inventory Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Quantity</span>
                  <span className={`text-sm font-medium ${item.quantity <= item.minQuantity ? 'text-red-500' : ''}`}>
                    {item.quantity}
                    {item.quantity <= item.minQuantity && (
                      <AlertTriangle className="h-3 w-3 ml-1 inline text-red-500" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Minimum Quantity</span>
                  <span className="text-sm font-medium">{item.minQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Value</span>
                  <span className="text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Dimensions and Physical Properties */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <RulerIcon className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Dimensions & Physical Properties
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Dimensions</span>
                  <span className="text-sm font-medium">
                    {item.dimensions ?
                      `${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.height} ${item.dimensions.unit}` :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Weight</span>
                  <span className="text-sm font-medium">
                    {item.weight ? `${item.weight} ${item.weightUnit}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Materials</span>
                  <span className="text-sm font-medium">
                    {item.materials && item.materials.length > 0 ?
                      item.materials.join(', ') :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Finish</span>
                  <span className="text-sm font-medium">{item.finish || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Color</span>
                  <span className="text-sm font-medium">{item.color || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Assembly */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Wrench className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Assembly
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Assembly Required</span>
                  <span className="text-sm font-medium">{item.assemblyRequired ? 'Yes' : 'No'}</span>
                </div>
                {item.assemblyRequired && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assembly Time</span>
                    <span className="text-sm font-medium">
                      {item.assemblyTime ? `${item.assemblyTime} minutes` : 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Warranty */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <ShieldCheck className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Warranty
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium">
                    {item.warranty && item.warranty.duration ?
                      `${item.warranty.duration} months` :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Coverage</span>
                  <span className="text-sm font-medium">
                    {item.warranty && item.warranty.coverage ?
                      item.warranty.coverage :
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Building2 className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Supplier
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-medium">
                    {item.supplier && item.supplier.name ?
                      item.supplier.name :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Lead Time</span>
                  <span className="text-sm font-medium">
                    {item.supplier && item.supplier.leadTime ?
                      `${item.supplier.leadTime} days` :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Minimum Order</span>
                  <span className="text-sm font-medium">
                    {item.supplier && item.supplier.minimumOrder ?
                      item.supplier.minimumOrder :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Rating</span>
                  <span className="text-sm font-medium">
                    {item.supplier && item.supplier.rating ?
                      `${item.supplier.rating}/5` :
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <MapPin className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Storage Location
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Warehouse</span>
                  <span className="text-sm font-medium">
                    {item.location && item.location.warehouse ?
                      item.location.warehouse :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Aisle</span>
                  <span className="text-sm font-medium">
                    {item.location && item.location.aisle ?
                      item.location.aisle :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Shelf</span>
                  <span className="text-sm font-medium">
                    {item.location && item.location.shelf ?
                      item.location.shelf :
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 space-y-6">
          {/* Notes */}
          {item.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Info className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Notes
              </h3>
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Tag className="h-4 w-4 mr-2 text-[#2D6BFF]" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-right mt-4">
            Last updated: {item.updated_at ? new Date(item.updated_at).toLocaleString() : 'N/A'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 