"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface MapProps {
  address: string;
}

export function Map({ address }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoordinates() {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.status === "OK") {
          const { lat, lng } = data.results[0].geometry.location;
          setCenter({ lat, lng });
        } else {
          setError("Error fetching location");
        }
      } catch (err) {
        setError("Error fetching location");
      }
    }
    fetchCoordinates();
  }, [address]);

  if (error) {
    return <div className="text-muted-foreground">{error}</div>;
  }

  if (!center) {
    return <div className="text-muted-foreground">Loading location...</div>;
  }

  if (!isLoaded) {
    return <div className="text-muted-foreground">Loading map...</div>;
  }

  if (!isLoaded) {
    return <div className="text-muted-foreground">Loading map...</div>;
  }

  return (
    <div className="aspect-video rounded-md overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
