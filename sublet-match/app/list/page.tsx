"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  DollarSign,
  Bed,
  Bath,
  ImagePlus,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
import Image from "next/image";

// List of US states
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

// List of property types
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
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
  });
  const [amenities, setAmenities] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
  
    const newFiles = Array.from(e.target.files);
    const previews: string[] = [];
    const accepted: File[] = [];
  
    for (const file of newFiles) {

      // ✅ Isolate only imageCompression
      const bufferReader = new FileReader();
      bufferReader.onloadend = () => {
        const buffer = new Uint8Array(bufferReader.result as ArrayBuffer);
        const sig = buffer.slice(0, 4);
        console.log(
          `🧪 File: ${file.name}, type: ${file.type}, signature:`,
          Array.from(sig).map((b) => b.toString(16).toUpperCase())
        );
        // Should print: ['FF', 'D8', 'FF', 'E0'] or something similar
      };
      bufferReader.readAsArrayBuffer(file);
      
      // ✅ Now proceed with compression and preview logic
      let compressed: File = file;
    
      try {
        compressed = await imageCompression(file, {
          maxSizeMB: 2.5,              // Allow larger file
          maxWidthOrHeight: 2400,      // Retain more detail
          initialQuality: 0.95,        // Preserve quality
        });
        
      } catch (compressionError) {
        console.warn("Compression error:", compressionError);
      }
  
      try {
        const reader = new FileReader();
  
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === "string" && result.startsWith("data:image/")) {
            previews.push(result);
            accepted.push(file);
  
            if (previews.length === newFiles.length) {
              setImagePreviews((prev) => [...prev, ...previews]);
              setImages((prev) => [...prev, ...accepted]);
            }
          } else {
            console.warn("⚠️ Invalid preview string:", result);
          }
        };
  
        reader.onerror = (readerError) => {
          console.error("❌ FileReader failed:", readerError);
        };
  
        reader.readAsDataURL(compressed);
      } catch (readerCrash) {
        console.error("❌ Unexpected readAsDataURL crash:", readerCrash);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
  
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        address: formData.address,
        city: formData.city,
        state: state,
        property_type: propertyType,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        available_from: new Date(date.from).toISOString(),
        available_to: new Date(date.to).toISOString(),
        host: "Active", // Default host status
        amenities: amenities,
      };
  
      const response = await fetch("http://localhost:8000/api/v1/listings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(listingData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create listing");
      }
  
      const listing = await response.json();
      console.log("Created listing:", listing);
  
      // Upload images if any
      if (images.length > 0) {
        console.log("Uploading images:", images);
  
        const formData = new FormData();
        images.forEach((file) => {
          formData.append("images", file);
        });
  
        const imageResponse = await fetch(
          `http://localhost:8000/api/v1/listings/${listing.id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
  
        const imagesData = await imageResponse.json();
  
        if (!imageResponse.ok) {
          toast({
            title: "Upload Failed",
            description: imagesData.detail || "Failed to upload images",
            variant: "destructive",
          });
          throw new Error(imagesData.detail || "Image upload failed");
        }
  
        console.log("Images uploaded:", imagesData);
      }
  
      toast({
        title: "Listing created!",
        description: "Your listing has been created successfully.",
      });
  
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating listing:", err);
      setError(err.message || "Failed to create listing");
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
                      value={formData.title}
                      onChange={handleInputChange}
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
                        value={formData.price}
                        onChange={handleInputChange}
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
                    value={formData.description}
                    onChange={handleInputChange}
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
                      value={formData.address}
                      onChange={handleInputChange}
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
                      value={formData.city}
                      onChange={handleInputChange}
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
                        value={formData.bedrooms}
                        onChange={handleInputChange}
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
                        value={formData.bathrooms}
                        onChange={handleInputChange}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amenities</label>
                  <Input
                    type="text"
                    placeholder="Enter amenities separated by spaces (e.g. wifi parking pool gym laundry)"
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate each amenity with a space. Common amenities
                    include: wifi, parking, pool, gym, laundry, air
                    conditioning, dishwasher, etc.
                  </p>
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
                      <div key={index} className="relative aspect-square w-full h-auto group">
                        <Image src={preview} alt={`Preview ${index + 1}`} className="object-contain object-center rounded-lg" fill />

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
                    {isLoading ? "Creating..." : "Create Listing"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
