"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building, DollarSign, Bed, Bath, ImagePlus, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Loader2 } from "lucide-react";

// Constants for image validation
const MAX_IMAGE_SIZE_MB = 5; // Maximum file size in MB
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;


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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  const [loadedStates, setLoadedStates] = useState<boolean[]>([]);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const auth = authService.isAuthenticated();
    setIsAuthenticated(auth);
    if (!auth) {
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
    const heic2any = (await import("heic2any")).default;

    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const oversizedFiles: string[] = [];
    const validFiles: File[] = [];
    
    // First validate all files for size
    for (const file of newFiles) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    }
    
    // Show error message for oversized files
    if (oversizedFiles.length > 0) {
      console.error(`Files too large: ${oversizedFiles.join(", ")}`);
      
      const errorMessage = `${oversizedFiles.length} image(s) exceed the ${MAX_IMAGE_SIZE_MB}MB limit and were skipped.`;
      
      // Display toast notification
      toast({
        title: "Images too large",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If all files are oversized, exit early
      if (validFiles.length === 0) return;
    }
    
    // Add new image placeholders
    const newIndices = Array(validFiles.length).fill(0).map((_, i) => imagePreviews.length + i);
    setLoadedStates(prev => [...prev, ...Array(validFiles.length).fill(true)]);
    setImagePreviews(prev => [...prev, ...Array(validFiles.length).fill("")]);
    setImages(prev => [...prev, ...Array(validFiles.length).fill(null)]);
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const index = imagePreviews.length + i - oversizedFiles.length;
      
      try {
        let workingFile = file;
  
        // Convert HEIC to JPEG if needed
        if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
          const heic2any = (await import("heic2any")).default; // ✅ dynamic import avoids server crash
          const buffer = await file.arrayBuffer();
          const jpegBlob = await heic2any({
            blob: new Blob([buffer]),
            toType: "image/jpeg",
            quality: 0.9,
          });
        
          workingFile = new File(
            [jpegBlob as BlobPart],
            file.name.replace(/\.heic$/i, ".jpg"),
            { type: "image/jpeg" }
          );
        }
        
  
        // Compress image
        const compressed = await imageCompression(workingFile, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
  
        // Create preview URL
        const previewUrl = URL.createObjectURL(compressed);
  
        // Update states
        setImages(prev => {
          const newImages = [...prev];
          newImages[index] = compressed;
          return newImages;
        });
        
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = previewUrl;
          return newPreviews;
        });
        
        setLoadedStates(prev => {
          const newStates = [...prev];
          newStates[index] = false;
          return newStates;
        });
      } catch (err) {
        console.warn("Failed to process image:", file.name, err);
        removeImage(index);
      }
    }
  };
  
  const removeImage = (index: number) => {
    // Clean up object URL if it exists to prevent memory leaks
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    setLoadedStates(prev => {
      const newStates = [...prev];
      newStates.splice(index, 1);
      return newStates;
    });
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

      const response = await fetch(`${API_URL}/listings/create`, {
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
          `${API_URL}/listings/${listing.id}/images`,
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
                    <div
                      key={index}
                      className="relative aspect-square w-full h-auto group overflow-hidden rounded-lg"
                    >
                      {/* Spinner shown until loaded AND preview URL exists */}
                      {(loadedStates[index] || !preview) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/20">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {/* Image only rendered after preload AND when preview URL exists */}
                      {!loadedStates[index] && preview && (
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-contain object-center rounded-lg transition-opacity duration-500 opacity-100"
                        />
                      )}

                      {/* Preload if preview URL exists */}
                      {loadedStates[index] && preview && (
                        <img
                          src={preview}
                          alt=""
                          className="hidden"
                          onLoad={() =>
                            setLoadedStates((prev) => {
                              const copy = [...prev];
                              copy[index] = false;
                              return copy;
                            })
                          }
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 z-20 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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