interface Coordinates {
  lat: number;
  lng: number;
}

interface Delivery {
  id: string;
  address: string;
  customer: string;
  items: string[];
  time_slot: string;
  driver: string;
  status: string;
  coordinates: Coordinates;
}

interface OptimizedRoute {
  totalDistance: number;
  totalDuration: number;
  waypoints: Delivery[];
}

interface DistanceMatrixElement {
  distance: { value: number; text: string; };
  duration: { value: number; text: string; };
  status: string;
}

interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}

interface DistanceMatrixResponse {
  status: string;
  rows: DistanceMatrixRow[];
  origin_addresses: string[];
  destination_addresses: string[];
}

export async function calculateOptimalRoute(
  deliveries: Delivery[],
  depotCoordinates: Coordinates,
  apiKey: string
): Promise<OptimizedRoute> {
  try {
    if (!deliveries || deliveries.length === 0) {
      throw new Error('No deliveries provided for route optimization');
    }

    if (!depotCoordinates || !depotCoordinates.lat || !depotCoordinates.lng) {
      throw new Error('Invalid depot coordinates');
    }

    // Validate delivery coordinates
    for (const delivery of deliveries) {
      if (!delivery.coordinates || !delivery.coordinates.lat || !delivery.coordinates.lng) {
        throw new Error(`Invalid coordinates for delivery ${delivery.id}`);
      }
    }

    const response = await fetch('/api/route-optimization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deliveries,
        depotCoordinates,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to optimize route');
    }

    // Validate response data
    if (!data.totalDistance || !data.totalDuration || !Array.isArray(data.waypoints)) {
      throw new Error('Invalid response from route optimization service');
    }

    return data;
  } catch (error: any) {
    console.error('Error calculating optimal route:', error);
    throw new Error(error.message || 'Failed to optimize route');
  }
}

// Helper function to calculate distance between two points using Haversine formula
function getDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

function estimateDuration(distance: number): number {
  // Rough estimate: 30km/h average speed in city
  return (distance / 30) * 60; // Duration in minutes
}

function nearestNeighborAlgorithm(
  matrix: { distance: number; duration: number; }[][],
  deliveries: Delivery[]
): Delivery[] {
  const visited = new Set<string>();
  const route: Delivery[] = [];
  let currentIndex = 0;

  while (visited.size < deliveries.length) {
    let nearestDistance = Infinity;
    let nearestIndex = -1;

    for (let i = 0; i < deliveries.length; i++) {
      if (!visited.has(deliveries[i].id)) {
        const distance = matrix[currentIndex][i].distance;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
    }

    if (nearestIndex !== -1) {
      const nextDelivery = deliveries[nearestIndex];
      route.push(nextDelivery);
      visited.add(nextDelivery.id);
      currentIndex = nearestIndex;
    }
  }

  return route;
} 