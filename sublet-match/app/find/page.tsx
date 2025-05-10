"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Calendar,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { listingService } from "@/app/services/listing";
import { authService } from "@/lib/services/auth";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function normalizeLocation(loc: string) {
  return loc.replace(/\s*,\s*/g, ", ").trim();
}

export default function FindPage() {
  const [priceRange, setPriceRange] = useState([500, 3000]);
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filter states
  const [location, setLocation] = useState("any");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [bedrooms, setBedrooms] = useState("any");
  const [bathrooms, setBathrooms] = useState("any");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsAuthenticated(!!authService.getToken());
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await listingService.getAllListings();
        setListings(data);
        setFilteredListings(data);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        setError(error.message || "Failed to fetch listings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Get unique locations from listings (normalized)
  const locations = Array.from(
    new Set(
      listings.map((listing) =>
        normalizeLocation(`${listing.city}, ${listing.state}`)
      )
    )
  );

  const applyFilters = () => {
    let filtered = [...listings];

    // Apply location filter
    if (location !== "any") {
      filtered = filtered.filter(
        (listing) =>
          normalizeLocation(`${listing.city}, ${listing.state}`) === location
      );
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((listing) => {
        const availableFrom = new Date(listing.available_from);
        const availableTo = new Date(listing.available_to);
        return availableFrom <= dateRange.to! && availableTo >= dateRange.from!;
      });
    }

    // Apply price range filter
    filtered = filtered.filter(
      (listing) =>
        listing.price >= priceRange[0] && listing.price <= priceRange[1]
    );

    // Apply bedrooms filter
    if (bedrooms !== "any") {
      if (bedrooms === "studio") {
        filtered = filtered.filter((listing) => listing.bedrooms === 0);
      } else if (bedrooms === "3") {
        filtered = filtered.filter((listing) => listing.bedrooms === 3);
      } else if (bedrooms === "3+") {
        filtered = filtered.filter((listing) => listing.bedrooms >= 3);
      } else {
        filtered = filtered.filter(
          (listing) => listing.bedrooms === parseInt(bedrooms)
        );
      }
    }

    // Apply bathrooms filter
    if (bathrooms !== "any") {
      filtered = filtered.filter(
        (listing) => listing.bathrooms === parseFloat(bathrooms)
      );
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>LeaseLink</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Find a Sublet
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse available sublets for your summer plans
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by location..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={cn("md:block", showFilters ? "block" : "hidden")}>
              <div className="sticky top-20 space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Filters</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any location</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dates</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Select dates</span>
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Price Range
                        </label>
                        <span className="text-sm text-muted-foreground">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        value={priceRange}
                        min={500}
                        max={5000}
                        step={100}
                        onValueChange={setPriceRange}
                        className="py-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bedrooms</label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="3+">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bathrooms</label>
                      <Select value={bathrooms} onValueChange={setBathrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="2.5">2.5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No listings found. Try adjusting your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <Link
                      href={`/listing/${listing.id}?from=find`}
                      key={listing.id}
                      className="group"
                    >
                      <div className="overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-video relative">
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0].image_url}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Building className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">
                              {listing.city}, {listing.state}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {new Date(
                                listing.available_from
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                listing.available_to
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-3 font-medium">
                            ${listing.price}/month
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
            &copy; {new Date().getFullYear()} LeasLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
