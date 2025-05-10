"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listingService } from "@/lib/services/listing";
import { EditListingForm } from "@/components/edit-listing-form";

export default function EditListingPage() {
  const params = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (params?.id) {
          const data = await listingService.getListing(params.id as string);
          setListing(data);
        }
      } catch (err) {
        setError("Failed to load listing");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params?.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!listing) return <div>Listing not found</div>;

  return <EditListingForm listing={listing} />;
}
