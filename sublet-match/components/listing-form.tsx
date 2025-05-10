"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface ListingFormProps {
  listing?: any;
  onSubmit: (formData: Record<string, string | number>) => Promise<void>;
  showButtons?: boolean;
}

export function ListingForm({ listing, onSubmit, showButtons = true }: ListingFormProps) {
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

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: listing?.available_from ? new Date(listing.available_from) : undefined,
    to: listing?.available_to ? new Date(listing.available_to) : undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "bedrooms", "bathrooms"].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        available_from: dateRange.from?.toISOString() || "",
        available_to: dateRange.to?.toISOString() || "",
      };
      await onSubmit(payload);
    } catch (err) {
      toast.error("Failed to save listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10 px-4 py-8">
      {/* 🏠 Basic Info */}
      <section>
        <h3 className="text-lg font-semibold mb-2">🏠 Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="property_type">Property Type</Label>
            <Select value={formData.property_type} onValueChange={(val) => setFormData((p) => ({ ...p, property_type: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Apartment", "House", "Studio", "Loft"].map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
        </div>
      </section>

      {/* 📍 Location */}
      <section>
        <h3 className="text-lg font-semibold mb-2">📍 Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" value={formData.state} onChange={handleChange} />
          </div>
        </div>
      </section>

      {/* 📏 Details */}
      <section>
        <h3 className="text-lg font-semibold mb-2">📏 Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
          </div>
        </div>
      </section>
      

      {/* 🗓 Availability */}
      <section>
        <h3 className="text-lg font-semibold mb-2">🗓 Availability</h3>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </section>

      {/* 🧼 Amenities */}
      <section>
        <h3 className="text-lg font-semibold mb-2">🧼 Amenities</h3>
        <Textarea
          name="amenities"
          placeholder="Enter amenities separated by commas (e.g., WiFi, Parking, Pool)"
          value={formData.amenities}
          onChange={handleChange}
        />
      </section>

      {showButtons && (
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </form>
  );
}
