"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface MapProps {
  city: string;
  state: string;
}

// Simple city coordinates lookup
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "New York, NY": { lat: 40.7128, lng: -74.006 },
  "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
  "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
  "Houston, TX": { lat: 29.7604, lng: -95.3698 },
  "Phoenix, AZ": { lat: 33.4484, lng: -112.074 },
  "Philadelphia, PA": { lat: 39.9526, lng: -75.1652 },
  "San Antonio, TX": { lat: 29.4241, lng: -98.4936 },
  "San Diego, CA": { lat: 32.7157, lng: -117.1611 },
  "Dallas, TX": { lat: 32.7767, lng: -96.797 },
  "San Jose, CA": { lat: 37.3382, lng: -121.8863 },
  "Austin, TX": { lat: 30.2672, lng: -97.7431 },
  "Jacksonville, FL": { lat: 30.3322, lng: -81.6557 },
  "Fort Worth, TX": { lat: 32.7555, lng: -97.3308 },
  "Columbus, OH": { lat: 39.9612, lng: -82.9988 },
  "Charlotte, NC": { lat: 35.2271, lng: -80.8431 },
  "San Francisco, CA": { lat: 37.7749, lng: -122.4194 },
  "Indianapolis, IN": { lat: 39.7684, lng: -86.1581 },
  "Seattle, WA": { lat: 47.6062, lng: -122.3321 },
  "Denver, CO": { lat: 39.7392, lng: -104.9903 },
  "Washington, DC": { lat: 38.9072, lng: -77.0369 },
};

export function Map({ city, state }: MapProps) {
  const location = `${city}, ${state}`;
  const center = cityCoordinates[location] || { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

  return (
    <div className="aspect-video rounded-md overflow-hidden">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      >
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={12}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
