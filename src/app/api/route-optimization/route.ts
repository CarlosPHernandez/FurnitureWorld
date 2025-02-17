import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

// Helper function to calculate distance between two points using Haversine formula
function getDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
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

// Create a distance matrix using local calculations
function createLocalDistanceMatrix(origins: { lat: number; lng: number }[], destinations: { lat: number; lng: number }[]) {
  return origins.map(origin => 
    destinations.map(dest => ({
      distance: getDistance(origin, dest),
      duration: estimateDuration(getDistance(origin, dest))
    }))
  );
}

const client = new Client({});

export async function POST(request: Request) {
  try {
    const { deliveries, depotCoordinates } = await request.json();

    if (!deliveries?.length || !depotCoordinates) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Create distance matrix between all points
    const origins = [depotCoordinates, ...deliveries.map((d: any) => d.coordinates)];
    const destinations = [...deliveries.map((d: any) => d.coordinates), depotCoordinates];

    // Validate coordinates
    if (origins.some(coord => !coord?.lat || !coord?.lng) || 
        destinations.some(coord => !coord?.lat || !coord?.lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates in delivery data' },
        { status: 400 }
      );
    }

    let distanceMatrix;
    try {
      // Try to use Google Maps Distance Matrix API
      if (process.env.GOOGLE_MAPS_API_KEY) {
        const matrix = await client.distancematrix({
          params: {
            origins: origins.map(coord => `${coord.lat},${coord.lng}`),
            destinations: destinations.map(coord => `${coord.lat},${coord.lng}`),
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        });

        if (matrix.data.status === 'OK') {
          // Convert Google's response to our format
          distanceMatrix = matrix.data.rows.map(row => 
            row.elements.map(element => ({
              distance: element.distance.value / 1000, // Convert to km
              duration: element.duration.value / 60 // Convert to minutes
            }))
          );
        } else {
          throw new Error(`Google Maps API Error: ${matrix.data.status}`);
        }
      } else {
        throw new Error('Google Maps API key not configured');
      }
    } catch (error) {
      console.warn('Falling back to local distance calculations:', error);
      // Fallback to local calculations
      distanceMatrix = createLocalDistanceMatrix(origins, destinations);
    }

    // Implement nearest neighbor algorithm
    const route = nearestNeighborAlgorithm(distanceMatrix, deliveries);

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const currentIndex = deliveries.findIndex((d: any) => d.id === route[i].id);
      const nextIndex = deliveries.findIndex((d: any) => d.id === route[i + 1].id);
      
      if (currentIndex === -1 || nextIndex === -1) {
        throw new Error('Invalid route calculation: delivery not found');
      }
      
      totalDistance += distanceMatrix[currentIndex][nextIndex].distance;
      totalDuration += distanceMatrix[currentIndex][nextIndex].duration;
    }

    return NextResponse.json({
      totalDistance,
      totalDuration,
      waypoints: route,
    });
  } catch (error: any) {
    console.error('Route optimization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to optimize route',
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}

function nearestNeighborAlgorithm(
  matrix: { distance: number; duration: number; }[][],
  deliveries: any[]
): any[] {
  const visited = new Set<string>();
  const route: any[] = [];
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