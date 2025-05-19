"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { userService } from "@/app/services/user";
import { Building, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  images: { image_url: string }[];
}

export default function SavedListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSavedListings = async () => {
      const token = authService.getToken();
      if (!token) return router.push("/signin");

      try {
        const user = await userService.getCurrentUser(token);
        const res = await fetch(`${API_URL}/saved/saved-listings/?user_id=${user.id}`);
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error("Failed to fetch saved listings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedListings();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <span
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => router.push("/dashboard")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push("/dashboard");
              }
            }}
            aria-label="LeaseLink Dashboard"
          >
            <Building className="h-6 w-6 text-primary" />
            <span>LeaseLink</span>
          </span>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="link"
              className="flex items-center text-muted-foreground hover:text-foreground p-0"
              onClick={() => router.push("/find")}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Listings
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-6">Your Saved Listings</h1>
          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="text-muted-foreground">You have no saved listings.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video relative">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0].image_url}
                          alt={listing.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <p className="text-muted-foreground">
                        {listing.city}, {listing.state}
                      </p>
                      <p className="mt-2 font-medium">${listing.price}/month</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
