"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { listingService } from "@/lib/services/listing";
import { ListingForm } from "@/components/listing-form";
import { toast } from "sonner";

interface EditListingFormProps {
  listing: {
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
  };
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const handleSubmit = async (formData: any) => {
    try {
      await listingService.updateListing(listing.id, formData);
      toast.success("Listing updated successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    }
  };

  return <ListingForm listing={listing} onSubmit={handleSubmit} />;
}
