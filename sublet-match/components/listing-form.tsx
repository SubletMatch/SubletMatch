"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listingService } from "@/lib/services/listing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { toast } from "sonner";
import { format } from "date-fns";

interface ListingFormProps {
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    city: string;
    state: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    available_from: string;
    available_to: string;
    amenities: string;
  };
}

const propertyTypes = [
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Condo", label: "Condo" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Studio", label: "Studio" },
  { value: "Loft", label: "Loft" },
  { value: "Duplex", label: "Duplex" },
  { value: "Room", label: "Room" },
];

export function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    price: listing?.price || 0,
    address: listing?.address || "",
    city: listing?.city || "",
    state: listing?.state || "",
    property_type: listing?.property_type || "Apartment",
    bedrooms: listing?.bedrooms || 1,
    bathrooms: listing?.bathrooms || 1,
    available_from: listing?.available_from || "",
    available_to: listing?.available_to || "",
    amenities: listing?.amenities || "",
  });

  const [dateRange, setDateRange] = useState({
    from: listing?.available_from
      ? new Date(listing.available_from)
      : undefined,
    to: listing?.available_to ? new Date(listing.available_to) : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        available_from: dateRange.from?.toISOString(),
        available_to: dateRange.to?.toISOString(),
        amenities: formData.amenities || null,
        property_type: formData.property_type,
      };

      if (listing) {
        await listingService.updateListing(listing.id, data);
        toast.success("Listing updated successfully");
      } else {
        await listingService.createListing(data);
        toast.success("Listing created successfully");
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error("Failed to save listing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "bedrooms" || name === "bathrooms"
          ? Number(value)
          : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price per month ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_type">Property Type</Label>
          <Select
            name="property_type"
            value={formData.property_type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, property_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          placeholder="Enter amenities separated by commas (e.g., WiFi, Parking, Pool)"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : listing
            ? "Update Listing"
            : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
