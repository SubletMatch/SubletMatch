"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface MapProps {
  address: string;
}

export function Map({ address }: MapProps) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoordinates() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          const location = data.results[0].geometry.location;
          setCenter({ lat: location.lat, lng: location.lng });
        } else {
          setError("Location not found");
        }
      } catch (err) {
        setError("Failed to load map");
      }
    }
    fetchCoordinates();
  }, [address]);

  if (error) return <div>{error}</div>;
  if (!center) return <div>Loading map...</div>;

  return (
    <div className="aspect-video rounded-md overflow-hidden">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      >
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={15}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
