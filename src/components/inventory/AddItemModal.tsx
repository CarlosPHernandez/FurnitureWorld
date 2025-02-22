'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type ItemStatus = 'active' | 'discontinued' | 'seasonal'
type Season = 'spring' | 'summer' | 'fall' | 'winter'
type QualityStatus = 'passed' | 'failed' | 'pending'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: any) => void
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
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [imageUrl, setImageUrl] = useState('/download.jpg')
  const [dimensions, setDimensions] = useState('0 x 0 x 0 cm')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')
  const [materials, setMaterials] = useState('')
  const [finish, setFinish] = useState('')
  const [color, setColor] = useState('')
  const [assemblyRequired, setAssemblyRequired] = useState(false)
  const [assemblyTime, setAssemblyTime] = useState('')
  const [warranty, setWarranty] = useState({ duration: 12, coverage: 'Standard warranty' })
  const [supplier, setSupplier] = useState('')
  const [location, setLocation] = useState({ warehouse: 'MAIN', aisle: '', shelf: '' })
  const [status, setStatus] = useState<ItemStatus>('active')
  const [season, setSeason] = useState<Season | ''>('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [qualityControl, setQualityControl] = useState({
    lastInspection: new Date().toISOString().split('T')[0],
    inspector: '',
    status: 'pending' as QualityStatus
  })
  const [customization, setCustomization] = useState({
    available: false,
    options: [] as { type: string; choices: string[]; priceModifier: number }[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      name,
      sku,
      category,
      quantity: Number(quantity),
      minQuantity: 0,
      price: Number(price),
      cost: Number(cost),
      imageUrl,
      dimensions: {
        length: Number(dimensions.split(' ')[0]),
        width: Number(dimensions.split(' ')[2]),
        height: Number(dimensions.split(' ')[4]),
        unit: dimensions.split(' ')[6] as 'cm' | 'in'
      },
      weight: Number(weight),
      weightUnit: weightUnit as 'kg' | 'lb',
      materials: materials.split(',').map(m => m.trim()).filter(m => m),
      finish,
      color,
      assemblyRequired,
      assemblyTime: Number(assemblyTime),
      warranty,
      supplier: {
        id: '',
        name: supplier,
        leadTime: 7,
        minimumOrder: 1,
        priceBreaks: [],
        rating: 5
      },
      location,
      status,
      season,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      notes,
      qualityControl,
      customization
    })
    setName('')
    setSku('')
    setCategory('')
    setQuantity('')
    setPrice('')
    setCost('')
    setImageUrl('/download.jpg')
    setDimensions('0 x 0 x 0 cm')
    setWeight('')
    setWeightUnit('kg')
    setMaterials('')
    setFinish('')
    setColor('')
    setAssemblyRequired(false)
    setAssemblyTime('')
    setWarranty({ duration: 12, coverage: 'Standard warranty' })
    setSupplier('')
    setLocation({ warehouse: 'MAIN', aisle: '', shelf: '' })
    setStatus('active')
    setSeason('')
    setTags('')
    setNotes('')
    setQualityControl({
      lastInspection: new Date().toISOString().split('T')[0],
      inspector: '',
      status: 'pending'
    })
    setCustomization({
      available: false,
      options: []
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ItemStatus)}
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
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
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
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
                    value={dimensions.split(' ')[0]}
                    onChange={(e) => setDimensions(e.target.value + ' ' + dimensions.split(' ')[1] + ' ' + dimensions.split(' ')[2] + ' ' + dimensions.split(' ')[3] + ' ' + dimensions.split(' ')[4] + ' ' + dimensions.split(' ')[5] + ' ' + dimensions.split(' ')[6])}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="number"
                    value={dimensions.split(' ')[2]}
                    onChange={(e) => setDimensions(dimensions.split(' ')[0] + ' ' + e.target.value + ' ' + dimensions.split(' ')[2] + ' ' + dimensions.split(' ')[3] + ' ' + dimensions.split(' ')[4] + ' ' + dimensions.split(' ')[5] + ' ' + dimensions.split(' ')[6])}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input
                    type="number"
                    value={dimensions.split(' ')[4]}
                    onChange={(e) => setDimensions(dimensions.split(' ')[0] + ' ' + dimensions.split(' ')[1] + ' ' + dimensions.split(' ')[2] + ' ' + dimensions.split(' ')[3] + ' ' + e.target.value + ' ' + dimensions.split(' ')[5] + ' ' + dimensions.split(' ')[6])}
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
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
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
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter materials separated by commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Finish</label>
                <input
                  type="text"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
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
                  checked={assemblyRequired}
                  onChange={(e) => setAssemblyRequired(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Assembly Required</label>
              </div>
              {assemblyRequired && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assembly Time (minutes)</label>
                  <input
                    type="number"
                    value={assemblyTime}
                    onChange={(e) => setAssemblyTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    min="0"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Warranty Duration (months)</label>
                <input
                  type="number"
                  value={warranty.duration}
                  onChange={(e) => setWarranty({ ...warranty, duration: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Warranty Coverage</label>
                <input
                  type="text"
                  value={warranty.coverage}
                  onChange={(e) => setWarranty({ ...warranty, coverage: e.target.value })}
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
                  value={location.warehouse}
                  onChange={(e) => setLocation({ ...location, warehouse: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aisle</label>
                <input
                  type="text"
                  value={location.aisle}
                  onChange={(e) => setLocation({ ...location, aisle: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shelf</label>
                <input
                  type="text"
                  value={location.shelf}
                  onChange={(e) => setLocation({ ...location, shelf: e.target.value })}
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
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  value={qualityControl.inspector}
                  onChange={(e) => setQualityControl({ ...qualityControl, inspector: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={qualityControl.status}
                  onChange={(e) => setQualityControl({
                    ...qualityControl,
                    status: e.target.value as 'passed' | 'failed' | 'pending'
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
                checked={customization.available}
                onChange={(e) => setCustomization({ ...customization, available: e.target.checked })}
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