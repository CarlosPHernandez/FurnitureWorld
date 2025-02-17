import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Delivery {
  id: string;
  address: string;
  coordinates: Coordinates;
  status: string;
}

interface DeliveryMapProps {
  deliveries: Delivery[];
  optimizedRoute?: Delivery[] | null;
  depotCoordinates: Coordinates;
  isLoaded: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({ deliveries, optimizedRoute, depotCoordinates, isLoaded }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  useEffect(() => {
    if (!map || !optimizedRoute || optimizedRoute.length === 0) return;

    // Create waypoints from the optimized route
    const waypoints = optimizedRoute.map(delivery => ({
      location: new google.maps.LatLng(
        delivery.coordinates.lat,
        delivery.coordinates.lng
      ),
      stopover: true
    }));

    // Remove the last waypoint as it will be the destination
    const waypointsWithoutLast = waypoints.slice(0, -1);

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(depotCoordinates.lat, depotCoordinates.lng),
      destination: new google.maps.LatLng(
        optimizedRoute[optimizedRoute.length - 1].coordinates.lat,
        optimizedRoute[optimizedRoute.length - 1].coordinates.lng
      ),
      waypoints: waypointsWithoutLast,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING
    };

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        setDirections(result);
      } else {
        console.error('Error fetching directions:', status);
      }
    });
  }, [map, optimizedRoute, depotCoordinates]);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
    
    // Fit map to show all delivery points
    const bounds = new google.maps.LatLngBounds();
    
    // Only add depot coordinates if they are valid
    if (depotCoordinates && depotCoordinates.lat && depotCoordinates.lng) {
      bounds.extend(new google.maps.LatLng(depotCoordinates.lat, depotCoordinates.lng));
    }
    
    // Only add delivery points that have valid coordinates
    deliveries.forEach(delivery => {
      if (delivery.coordinates && delivery.coordinates.lat && delivery.coordinates.lng) {
        bounds.extend(new google.maps.LatLng(
          delivery.coordinates.lat,
          delivery.coordinates.lng
        ));
      }
    });
    
    // Only fit bounds if we have at least one valid point
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      // If no points or all points are the same, center on default location
      map.setCenter(defaultCenter);
      map.setZoom(12);
    } else {
      map.fitBounds(bounds);
    }
  };

  if (!isLoaded) {
    return <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      options={{
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        fullscreenControl: false,
        streetViewControl: false
      }}
    >
      {/* Depot Marker */}
      {depotCoordinates && depotCoordinates.lat && depotCoordinates.lng && (
        <Marker
          position={depotCoordinates}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          }}
        />
      )}

      {/* Delivery Markers (only show if no directions and have valid coordinates) */}
      {!directions && deliveries.map((delivery) => (
        delivery.coordinates && delivery.coordinates.lat && delivery.coordinates.lng && (
          <Marker
            key={delivery.id}
            position={delivery.coordinates}
            icon={{
              url: delivery.status === 'En Route' 
                ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(32, 32)
            }}
          />
        )
      ))}

      {/* Show route if optimized */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#2D6BFF',
              strokeWeight: 4
            }
          }}
        />
      )}
    </GoogleMap>
  );
};

export default DeliveryMap; 