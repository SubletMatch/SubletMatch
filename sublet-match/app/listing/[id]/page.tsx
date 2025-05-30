"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import {
  Bath,
  Bed,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  Share2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SaveButton } from "@/components/save-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/services/auth";
import { useRouter } from "next/navigation";
import { Map } from "@/components/map";
import { userService } from "@/app/services/user";
import { messagesService } from "@/lib/services/messages";
import { useRef } from "react";

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
  user: {
    name: string;
    email: string;
  };
  amenities?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PageParams {
  id: string;
}

export default function ListingPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [initiallySaved, setInitiallySaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [listingId, setListingId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fromFind = searchParams.get("from") === "find";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    if (id) {
      setListingId(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchListingAndUser = async () => {
      if (!listingId) return;
  
      try {
        const token = authService.getToken();
        if (!token) {
          router.push("/signin");
          return;
        }
  
        // Fetch both listing and current user
        const [listingResponse, currentUser] = await Promise.all([
          fetch(`${API_URL}/listings/${listingId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          userService.getCurrentUser(token)
        ]);
  
        if (!listingResponse.ok) {
          throw new Error("Failed to fetch listing");
        }
  
        const listingData = await listingResponse.json();
        setListing(listingData);
        setCurrentUser(currentUser);
  
        // Check if this listing is saved
        if (currentUser?.id) {
          const savedResponse = await fetch(`${API_URL}/saved/saved-listings/?user_id=${currentUser.id}`);
          const savedListings = await savedResponse.json();
          setInitiallySaved(savedListings.some((l: any) => l.id === listingId));
        }
  
      } catch (err) {
        setError("Failed to load listing");
        console.error("Error fetching listing:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (authService.isAuthenticated()) {
      fetchListingAndUser();
    } else {
      router.push("/signin");
    }
  }, [router, listingId]);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handlePrevImage = () => {
    if (!listing?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!listing?.images) return;
    setCurrentImageIndex((prev) =>
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !listing) return;

    try {
      const token = authService.getToken();
      if (!token) {
        console.error("No token found in localStorage");
        router.push("/signin");
        return;
      }

      // Get current user's ID from user service
      try {
        const currentUser = await userService.getCurrentUser(token);
        if (!currentUser?.id) {
          throw new Error("Could not get current user information");
        }
        setCurrentUser(currentUser); // 👈 Save to state

        // 🧠 NEW: check if this listing is saved
        const check = await fetch(`${API_URL}/saved/saved-listings/?user_id=${currentUser.id}`);
        const savedListings = await check.json();
        setInitiallySaved(savedListings.some((l: any) => l.id === id));  // use `id`, not listing.id, since listing isn’t set yet


        console.log("Current user:", currentUser);
        console.log("Listing user:", listing.user);
        console.log("Listing ID:", listing.id);

        const result = await messagesService.sendMessage({
          content: message,
          receiver_id: listing.user.id,
          listing_id: listing.id,
          sender_id: currentUser.id,
        });

        if (result.success) {
          toast({
            title: "Message sent!",
            description: "Your message has been sent to the host.",
          });
          // Redirect to dashboard messages tab
          router.push("/dashboard?tab=messages");
        } else {
          throw new Error(result.error || "Failed to send message");
        }
      } catch (error: unknown) {
        console.error("Error getting current user:", error);
        // If we get a 401, it means the token is invalid/expired
        if (error instanceof Error && error.message.includes("401")) {
          authService.logout();
          router.push("/signin");
          return;
        }
        throw error;
      }
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">
          {error || "Listing not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <span
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => {
              if (isAuthenticated) {
                router.push("/dashboard");
              } else {
                router.push("/");
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (isAuthenticated) {
                  router.push("/dashboard");
                } else {
                  router.push("/");
                }
              }
            }}
            aria-label="LeaseLink Home or Dashboard"
          >
            <Building className="h-6 w-6 text-primary" />
            <span>LeaseLink</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="link"
              className="flex items-center text-muted-foreground hover:text-foreground p-0"
              onClick={() => {
                if (fromFind) {
                  router.push("/find");
                } else {
                  router.push("/dashboard");
                }
              }}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-xl mb-6">
                <div className="aspect-video relative">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={
                        listing.images[currentImageIndex]?.image_url ||
                        "/placeholder.svg"
                      }
                      alt={`Image ${currentImageIndex + 1} of ${listing.title}`}
                      fill
                      className="object-contain object-center rounded-lg"
                      sizes="(max-width: 768px) 100vw, 66vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                      <Building className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {listing.images && listing.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full"
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                    {listing.images.map((image, index) => (
                      <div
                        key={image.image_url}
                        className={`relative aspect-square w-16 cursor-pointer rounded-lg overflow-hidden ${
                          index === currentImageIndex
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  {currentUser && listing && (
                    <SaveButton
                      userId={currentUser.id}
                      listingId={listing.id}
                      initiallySaved={initiallySaved}
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const url = `${window.location.origin}/listing/${listing.id}`;
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: listing.title, url });
                        } else {
                          await navigator.clipboard.writeText(url);
                          toast({
                            title: "Link copied!",
                            description: "Listing URL copied to your clipboard.",
                          });
                        }
                      } catch (err) {
                        console.error("Failed to share:", err);
                        toast({
                          title: "Error",
                          description: "Could not share this listing.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>

                </div>
              </div>


              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {listing.address}, {listing.city}, {listing.state}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <span>
                  Available:{" "}
                  {new Date(listing.available_from).toLocaleDateString()} -{" "}
                  {new Date(listing.available_to).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {listing.bedrooms} Bedroom
                    {listing.bedrooms !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {listing.bathrooms} Bathroom
                    {listing.bathrooms !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="font-medium text-lg">
                  ${listing.price}/month
                </div>
              </div>

              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-muted-foreground">{listing.description}</p>
                </TabsContent>
                <TabsContent value="amenities" className="mt-4">
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing?.amenities?.split(" ").map((amenity, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="location" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {listing.address}, {listing.city}, {listing.state}
                      </span>
                    </div>
                    <Map
                      address={`${listing.address}, ${listing.city}, ${listing.state}`}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Hosted by {listing?.user?.name || "Unknown Host"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {listing?.user?.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="space-y-4">
                    <h3 className="font-medium">Contact the host</h3>
                    <Textarea
                      placeholder="Hi, I'm interested in your sublet..."
                      className="min-h-[120px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleSendMessage}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-5 w-5 text-primary" />
            <p className="font-medium">LeaseLink</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} LeaseLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}