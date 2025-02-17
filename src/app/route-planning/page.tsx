'use client'

import { useState, useEffect } from 'react'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { calculateOptimalRoute } from '@/utils/routeOptimization'
import { 
  ChevronRight,
  Calendar,
  Truck,
  MapPin,
  Clock,
  Package,
  Users,
  Filter,
  Search,
} from 'lucide-react'
import DeliveryMap from '@/components/DeliveryMap'
import { useLoadScript } from '@react-google-maps/api'

// Company depot coordinates (example: New York City center)
const DEPOT_COORDINATES = {
  lat: 40.7128,
  lng: -74.0060
}

interface Delivery {
  id: string;
  address: string;
  customer: string;
  items: string[];
  time_slot: string;
  driver: string;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function RoutePlanning() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedRoute, setOptimizedRoute] = useState<{
    totalDistance: number;
    totalDuration: number;
    waypoints: Delivery[];
  } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places']
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeRoutes = async () => {
    if (deliveries.length === 0) return;
    
    setIsOptimizing(true);
    try {
      const result = await calculateOptimalRoute(
        deliveries,
        DEPOT_COORDINATES,
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
      );
      setOptimizedRoute({
        totalDistance: result.totalDistance,
        totalDuration: result.totalDuration,
        waypoints: result.waypoints as Delivery[]
      });
    } catch (error) {
      console.error('Error optimizing routes:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) {
    return (
      <DeliveryLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D6BFF] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deliveries...</p>
          </div>
        </div>
      </DeliveryLayout>
    );
  }

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Routes</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Route Planning</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleOptimizeRoutes}
              disabled={isOptimizing || deliveries.length === 0}
              className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg disabled:opacity-50"
            >
              <Truck className="mr-2 h-4 w-4" />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize Routes'}</span>
            </button>
          </div>
        </div>

        {/* Route Summary */}
        {optimizedRoute && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Optimized Route Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Distance</p>
                <p className="text-lg font-medium">{optimizedRoute.totalDistance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Duration</p>
                <p className="text-lg font-medium">{Math.round(optimizedRoute.totalDuration)} minutes</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="aspect-video bg-gray-100 rounded-lg mb-4">
              <DeliveryMap
                deliveries={deliveries}
                optimizedRoute={optimizedRoute?.waypoints}
                depotCoordinates={DEPOT_COORDINATES}
                isLoaded={isLoaded}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search address..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  />
                </div>
              </div>
              <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Today</span>
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
                <Users className="mr-2 h-4 w-4" />
                <span>Drivers</span>
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {optimizedRoute ? 'Optimized Schedule' : 'Today\'s Schedule'}
            </h3>
            {deliveries.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No deliveries scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {(optimizedRoute?.waypoints || deliveries).map((delivery) => (
                  <div key={delivery.id} className="p-4 border border-gray-100 rounded-lg hover:border-[#2D6BFF] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-[#2D6BFF]">{delivery.id}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        delivery.status === 'En Route'
                          ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                          : 'bg-[#00C48C]/10 text-[#00C48C]'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{delivery.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{delivery.time_slot}</span>
                      </div>
                      <div className="flex items-start">
                        <Package className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{delivery.items.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{delivery.driver}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
} 