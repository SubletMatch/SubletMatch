"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  Calendar,
  MapPin,
  DollarSign,
  Home,
  Bed,
  Bath,
  ImagePlus,
  X,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/lib/services/auth";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Condo",
  "Townhouse",
  "Studio",
  "Loft",
  "Duplex",
  "Room",
];

export default function ListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [state, setState] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);

      // Create previews for new images
      newImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const values = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      bedrooms: formData.get("bedrooms") as string,
      bathrooms: formData.get("bathrooms") as string,
    };

    try {
      const listingData = {
        title: values.title,
        description: values.description,
        price: Number(values.price),
        address: values.address,
        city: values.city,
        state: state,
        property_type: propertyType,
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        available_from: date.from.toISOString(),
        available_to: date.to.toISOString(),
      };

      console.log(
        "Sending listing data:",
        JSON.stringify(listingData, null, 2)
      );

      // First, create the listing
      const listingResponse = await fetch(
        "http://localhost:8000/api/v1/listings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(listingData),
        }
      );

      if (!listingResponse.ok) {
        const error = await listingResponse.json();
        console.error("Error creating listing:", error);
        throw new Error(error.detail || "Error creating listing");
      }

      const listing = await listingResponse.json();
      console.log("Created listing:", listing);

      // Then, upload images if any
      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach((image) => {
          imageFormData.append("images", image);
        });

        console.log("Uploading images:", images);

        const imageResponse = await fetch(
          `http://localhost:8000/api/v1/listings/${listing.id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: imageFormData,
          }
        );

        if (!imageResponse.ok) {
          const error = await imageResponse.json();
          console.error("Error uploading images:", error);
          throw new Error(error.detail || "Error uploading images");
        }

        const uploadedImages = await imageResponse.json();
        console.log("Uploaded images:", uploadedImages);
      }

      toast({
        title: "Listing created!",
        description: "Your listing has been created successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>SubletMatch</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Listing</CardTitle>
              <CardDescription>
                Fill out the form below to create your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Spacious 2BR Apartment in Downtown"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price per month
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="e.g., 1500"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property, including amenities, nearby attractions, and any special features..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="e.g., 123 Main St"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g., New York"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">
                      State
                    </label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="propertyType"
                      className="text-sm font-medium"
                    >
                      Property Type
                    </label>
                    <Select
                      value={propertyType}
                      onValueChange={setPropertyType}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="bedrooms" className="text-sm font-medium">
                      Bedrooms
                    </label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g., 2"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bathrooms" className="text-sm font-medium">
                      Bathrooms
                    </label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="e.g., 1.5"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Dates</label>
                  <DateRangePicker date={date} onDateChange={setDate} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Photos</label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add photos of your property. You can upload up to 10
                      photos.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square group">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.length < 10 && (
                      <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Add Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
