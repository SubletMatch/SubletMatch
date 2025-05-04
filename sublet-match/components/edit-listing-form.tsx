"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { listingService } from "@/lib/services/listing";
import { ListingForm } from "@/components/listing-form";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface EditListingFormProps {
  listing: {
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
    amenities: string;
    images: { id: string; image_url: string }[];
  };
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<{ id: string; image_url: string }[]>(
    listing.images || []
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImages((prev) => [...prev, ...files]);
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = async (index: number, isExisting: boolean) => {
    try {
      if (isExisting) {
        const imageToDelete = images[index];
        await listingService.deleteListingImage(listing.id, imageToDelete.id);
        setImages((prev) => prev.filter((_, i) => i !== index));
        toast.success("Image deleted successfully");
      } else {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
          const newUrls = [...prev];
          URL.revokeObjectURL(newUrls[index]);
          return newUrls.filter((_, i) => i !== index);
        });
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const handleSubmit = async (formData: Record<string, string | number>) => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();

      // Add all existing form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      // Add new images
      newImages.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Add existing image URLs
      images.forEach((image) => {
        formDataToSend.append("existing_images", image.image_url);
      });

      await listingService.updateListing(listing.id, formDataToSend);
      toast.success("Listing updated successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <ListingForm
          listing={listing}
          onSubmit={handleSubmit}
          showButtons={false}
        />

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Listing Images</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add or remove images for your listing
              </p>
            </div>
            <label className="relative inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer">
              <ImagePlus className="h-4 w-4" />
              <span>Add Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Existing Images */}
            {images.map((image, index) => (
              <div
                key={image.image_url}
                className="relative aspect-square group rounded-lg overflow-hidden border"
              >
                <Image
                  src={image.image_url}
                  alt={`Listing image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* New Image Previews */}
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square group rounded-lg overflow-hidden border"
              >
                <Image
                  src={url}
                  alt={`New image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index, false)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state when no images */}
            {images.length === 0 && previewUrls.length === 0 && (
              <div className="col-span-full aspect-[2/1] border-2 border-dashed rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No images added yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          onClick={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
