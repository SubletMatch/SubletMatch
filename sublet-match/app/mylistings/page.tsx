"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Listing {
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
  images: { image_url: string }[];
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/listings/my",
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError("Failed to load listings");
        console.error("Error fetching listings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      fetchListings();
    } else {
      router.push("/signin");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">My Listings</h1>

      {listings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            You haven't created any listings yet.
          </p>
          <Link href="/list">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              {listing.images && listing.images.length > 0 && (
                <>
                  <div className="relative h-48">
                    <img
                      src={listing.images[0].image_url}
                      alt={listing.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </>
              )}
              <CardHeader>
                <CardTitle>{listing.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.address}, {listing.city}, {listing.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>${listing.price}/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{listing.property_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span>{listing.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4" />
                    <span>{listing.bathrooms} baths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(listing.available_from), "MMM d, yyyy")}{" "}
                      - {format(new Date(listing.available_to), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/listing/${listing.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
