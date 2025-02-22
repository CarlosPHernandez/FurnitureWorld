import { NextResponse } from 'next/server';
import { Client, DirectionsResponse, DistanceMatrixResponse, TravelMode } from '@googlemaps/google-maps-services-js';

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryStop {
  id: string;
  location: Location;
  address: string;
}

interface OptimizedRoute {
  stops: DeliveryStop[];
  totalDistance: number;
  totalDuration: number;
}

interface RouteError {
  message: string;
  code?: string;
  details?: string;
}

// Helper function to calculate distance between two points using Haversine formula
function getDistance(point1: Location, point2: Location): number {
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

const client = new Client({});

export async function POST(request: Request) {
  try {
    const data = await request.json() as { stops: DeliveryStop[] };
    const { stops } = data;

    if (!stops || !Array.isArray(stops)) {
      return NextResponse.json({ 
        message: 'Invalid input: stops must be an array'
      } as RouteError, { status: 400 });
    }

    // Calculate distance matrix
    const origins = stops.map(stop => ({ lat: stop.location.lat, lng: stop.location.lng }));
    const destinations = [...origins];

    const distanceMatrix: number[][] = [];
    for (let i = 0; i < origins.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < destinations.length; j++) {
        if (i === j) {
          row.push(0);
          continue;
        }

        try {
          const response = await client.distancematrix({
            params: {
              origins: [`${origins[i].lat},${origins[i].lng}`],
              destinations: [`${destinations[j].lat},${destinations[j].lng}`],
              mode: TravelMode.driving,
              key: process.env.GOOGLE_MAPS_API_KEY || ''
            }
          });

          const element = response.data.rows[0]?.elements[0];
          if (element?.status === 'OK' && element.distance) {
            row.push(element.distance.value);
          } else {
            row.push(Infinity);
          }
        } catch (error) {
          console.error('Error calculating distance:', error);
          row.push(Infinity);
        }
      }
      distanceMatrix.push(row);
    }

    // Nearest neighbor algorithm
    const visited = new Set<number>();
    const route: number[] = [0];
    visited.add(0);

    while (visited.size < stops.length) {
      const current = route[route.length - 1];
      let nearest = -1;
      let minDistance = Infinity;

      for (let i = 0; i < stops.length; i++) {
        if (!visited.has(i) && distanceMatrix[current][i] < minDistance) {
          nearest = i;
          minDistance = distanceMatrix[current][i];
        }
      }

      if (nearest === -1) break;
      route.push(nearest);
      visited.add(nearest);
    }

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < route.length - 1; i++) {
      try {
        const response = await client.directions({
          params: {
            origin: `${stops[route[i]].location.lat},${stops[route[i]].location.lng}`,
            destination: `${stops[route[i + 1]].location.lat},${stops[route[i + 1]].location.lng}`,
            mode: TravelMode.driving,
            key: process.env.GOOGLE_MAPS_API_KEY || ''
          }
        });

        const leg = response.data.routes[0]?.legs[0];
        if (leg?.distance?.value && leg?.duration?.value) {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        }
      } catch (error) {
        console.error('Error calculating route leg:', error);
      }
    }

    const optimizedRoute: OptimizedRoute = {
      stops: route.map(index => stops[index]),
      totalDistance,
      totalDuration
    };

    return NextResponse.json(optimizedRoute);
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to optimize route',
      details: error instanceof Error ? error.message : String(error)
    } as RouteError, { status: 500 });
  }
} 