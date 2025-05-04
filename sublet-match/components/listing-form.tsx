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
    amenities?: string;
  };
  onSubmit: (formData: Record<string, string | number>) => Promise<void>;
  showButtons?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  address?: string;
  city?: string;
  state?: string;
  property_type?: string;
  bedrooms?: string;
  bathrooms?: string;
  available_from?: string;
  available_to?: string;
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

export function ListingForm({
  listing,
  onSubmit,
  showButtons = true,
}: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
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
    from: listing?.available_from
      ? new Date(listing.available_from)
      : undefined,
    to: listing?.available_to ? new Date(listing.available_to) : undefined,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.property_type) {
      newErrors.property_type = "Property type is required";
    }
    if (formData.bedrooms <= 0) {
      newErrors.bedrooms = "Number of bedrooms must be greater than 0";
    }
    if (formData.bathrooms <= 0) {
      newErrors.bathrooms = "Number of bathrooms must be greater than 0";
    }
    if (!dateRange.from) {
      newErrors.available_from = "Available from date is required";
    }
    if (!dateRange.to) {
      newErrors.available_to = "Available to date is required";
    }
    if (dateRange.from && dateRange.to && dateRange.from > dateRange.to) {
      newErrors.available_to = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        ...formData,
        available_from: dateRange.from?.toISOString(),
        available_to: dateRange.to?.toISOString(),
        amenities: formData.amenities || null,
        property_type: formData.property_type,
      };

      await onSubmit(data);
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
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
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
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_type">Property Type</Label>
          <Select
            name="property_type"
            value={formData.property_type}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, property_type: value }));
              if (errors.property_type) {
                setErrors((prev) => ({ ...prev, property_type: undefined }));
              }
            }}
          >
            <SelectTrigger
              className={errors.property_type ? "border-red-500" : ""}
            >
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
          {errors.property_type && (
            <p className="text-sm text-red-500">{errors.property_type}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? "border-red-500" : ""}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={errors.state ? "border-red-500" : ""}
          />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state}</p>
          )}
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
            className={errors.bedrooms ? "border-red-500" : ""}
          />
          {errors.bedrooms && (
            <p className="text-sm text-red-500">{errors.bedrooms}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={handleChange}
            className={errors.bathrooms ? "border-red-500" : ""}
          />
          {errors.bathrooms && (
            <p className="text-sm text-red-500">{errors.bathrooms}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <DateRangePicker
          date={dateRange}
          onDateChange={(range) => {
            setDateRange(range);
            if (errors.available_from || errors.available_to) {
              setErrors((prev) => ({
                ...prev,
                available_from: undefined,
                available_to: undefined,
              }));
            }
          }}
        />
        {(errors.available_from || errors.available_to) && (
          <p className="text-sm text-red-500">
            {errors.available_from || errors.available_to}
          </p>
        )}
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

      {showButtons && (
        <div className="flex justify-end gap-4">
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
