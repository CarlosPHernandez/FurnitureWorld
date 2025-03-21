interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

interface Supplier {
  id: string;
  name: string;
  leadTime: number;
  minimumOrder: number;
  priceBreaks: {
    quantity: number;
    price: number;
  }[];
  rating: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number; // Cost of Goods Sold
  imageUrl: string;
  // Additional furniture-specific fields
  dimensions: Dimensions;
  weight: number;
  weightUnit: 'kg' | 'lb';
  materials: string[];
  finish: string;
  color: string;
  assemblyRequired: boolean;
  assemblyTime: number; // in minutes
  warranty: {
    duration: number; // in months
    coverage: string;
  };
  supplier: Supplier;
  location: {
    warehouse: string;
    aisle: string;
    shelf: string;
  };
  status: 'active' | 'discontinued' | 'seasonal';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  tags: string[];
  notes: string;
  qualityControl: {
    lastInspection: string;
    inspector: string;
    status: 'passed' | 'failed' | 'pending';
    issues?: string[];
  };
  customization: {
    available: boolean;
    options?: {
      type: string;
      choices: string[];
      priceModifier: number;
    }[];
  };
  // Database fields
  created_at?: string;
  updated_at?: string;
  // For backward compatibility
  lastUpdated?: string;
} 