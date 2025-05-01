import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export default function CreateListingPage() {
  const [amenities, setAmenities] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // ... existing form data ...
      formData.append("amenities", amenities);
      // ... rest of submit logic ...
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create a New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... existing form fields ... */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Amenities</label>
          <Input
            type="text"
            placeholder="Enter amenities separated by spaces (e.g. wifi parking pool)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Separate each amenity with a space
          </p>
        </div>

        {/* ... rest of the form ... */}
      </form>
    </div>
  );
}
