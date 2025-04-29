"use client"

import { useState } from "react"
import Link from "next/link"
import { Building, Calendar, ChevronDown, MapPin, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: "Spacious 1BR in Downtown",
    location: "New York, NY",
    dates: "Jun 1 - Aug 31",
    price: 1800,
    image: "/placeholder.svg?height=300&width=500&text=Apartment 1",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 2,
    title: "Cozy Studio near Campus",
    location: "Boston, MA",
    dates: "May 15 - Jul 30",
    price: 1200,
    image: "/placeholder.svg?height=300&width=500&text=Apartment 2",
    bedrooms: 0,
    bathrooms: 1,
  },
  {
    id: 3,
    title: "Modern 2BR with Balcony",
    location: "Chicago, IL",
    dates: "Jun 15 - Sep 15",
    price: 2200,
    image: "/placeholder.svg?height=300&width=500&text=Apartment 3",
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: 4,
    title: "Luxury Loft in Arts District",
    location: "Los Angeles, CA",
    dates: "Jul 1 - Aug 31",
    price: 2500,
    image: "/placeholder.svg?height=300&width=500&text=Apartment 4",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 5,
    title: "Charming 1BR in Historic Building",
    location: "Philadelphia, PA",
    dates: "Jun 1 - Aug 15",
    price: 1400,
    image: "/placeholder.svg?height=300&width=500&text=Apartment 5",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 6,
    title: "Sunny 2BR near the Beach",
    location: "Miami, FL",
    dates: "Jun 15 - Sep 1",
    price: 2800,
    image: "/placeholder.svg?height=300&width=500&text=Apartment 6",
    bedrooms: 2,
    bathrooms: 2,
  },
]

export default function FindPage() {
  const [priceRange, setPriceRange] = useState([500, 3000])
  const [showFilters, setShowFilters] = useState(false)
  const [listings, setListings] = useState(mockListings)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>SubletMatch</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Find a Sublet</h1>
              <p className="text-muted-foreground mt-1">Browse available sublets for your summer plans</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search by location..." className="w-full pl-8" />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
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
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ny">New York, NY</SelectItem>
                          <SelectItem value="bos">Boston, MA</SelectItem>
                          <SelectItem value="chi">Chicago, IL</SelectItem>
                          <SelectItem value="la">Los Angeles, CA</SelectItem>
                          <SelectItem value="mia">Miami, FL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dates</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            Select dates
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          {/* Calendar would go here in a real implementation */}
                          <div className="p-4">
                            <p className="text-sm text-muted-foreground">Select your dates</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Price Range</label>
                        <span className="text-sm text-muted-foreground">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </div>
                      <Slider defaultValue={priceRange} min={500} max={5000} step={100} onValueChange={setPriceRange} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bedrooms</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bathrooms</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
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
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          alt={listing.title}
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          src={listing.image || "/placeholder.svg"}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{listing.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{listing.dates}</span>
                        </div>
                        <div className="mt-3 font-medium">${listing.price}/month</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-5 w-5 text-primary" />
            <p className="font-medium">SubletMatch</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SubletMatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
