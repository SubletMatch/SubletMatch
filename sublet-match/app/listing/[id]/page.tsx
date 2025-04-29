"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Mock data for a single listing
const mockListing = {
  id: 1,
  title: "Spacious 1BR in Downtown",
  location: "New York, NY",
  dates: "Jun 1 - Aug 31, 2023",
  price: 1800,
  description:
    "This beautiful one-bedroom apartment is located in the heart of downtown. It features hardwood floors, high ceilings, and large windows that let in plenty of natural light. The kitchen is fully equipped with modern appliances, and the bathroom has been recently renovated. The building has a rooftop terrace with stunning views of the city skyline. It's within walking distance to restaurants, shops, and public transportation. Perfect for a summer sublet!",
  bedrooms: 1,
  bathrooms: 1,
  amenities: ["Wi-Fi", "Air Conditioning", "Washer/Dryer", "Dishwasher", "Elevator", "Gym", "Rooftop Access"],
  images: [
    "/placeholder.svg?height=500&width=800&text=Living Room",
    "/placeholder.svg?height=500&width=800&text=Bedroom",
    "/placeholder.svg?height=500&width=800&text=Kitchen",
    "/placeholder.svg?height=500&width=800&text=Bathroom",
  ],
  host: {
    name: "Alex Johnson",
    image: "/placeholder.svg?height=100&width=100&text=AJ",
    responseRate: "95%",
    responseTime: "within a few hours",
  },
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [message, setMessage] = useState("")

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? mockListing.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === mockListing.images.length - 1 ? 0 : prev + 1))
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message sent!",
        description: "Your message has been sent to the host.",
      })
      setMessage("")
    }
  }

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
          <div className="flex items-center mb-6">
            <Link href="/find" className="flex items-center text-muted-foreground hover:text-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Listings
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-xl mb-6">
                <div className="aspect-video relative">
                  <img
                    src={mockListing.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`Image ${currentImageIndex + 1} of ${mockListing.title}`}
                    className="w-full h-full object-cover"
                  />
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
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                  {mockListing.images.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? "bg-primary" : "bg-background/80"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-3xl font-bold tracking-tight">{mockListing.title}</h1>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Button variant="outline" size="sm">
                    <Heart className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span>{mockListing.location}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <span>Available: {mockListing.dates}</span>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span>{mockListing.bedrooms} Bedroom</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span>{mockListing.bathrooms} Bathroom</span>
                </div>
                <div className="font-medium text-lg">${mockListing.price}/month</div>
              </div>

              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-muted-foreground">{mockListing.description}</p>
                </TabsContent>
                <TabsContent value="amenities" className="mt-4">
                  <ul className="grid grid-cols-2 gap-2">
                    {mockListing.amenities.map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="location" className="mt-4">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Map would be displayed here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={mockListing.host.image || "/placeholder.svg"}
                        alt={mockListing.host.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">Hosted by {mockListing.host.name}</h3>
                      <p className="text-sm text-muted-foreground">Response rate: {mockListing.host.responseRate}</p>
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
