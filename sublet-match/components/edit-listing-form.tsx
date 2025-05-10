"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { listingService } from "@/lib/services/listing";
import { ListingForm } from "@/components/listing-form";
import { toast } from "sonner";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";
let heic2any: any = null;
if (typeof window !== "undefined") {
  import("heic2any")
    .then((module) => {
      heic2any = module.default;
    })
    .catch((err) => console.error("Failed to load heic2any:", err));
}

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

const MAX_IMAGES_TOTAL = 10;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [images, setImages] = useState(listing.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES_TOTAL) {
      toast.error(`Maximum ${MAX_IMAGES_TOTAL} images allowed`);
      return;
    }

    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          // Check file size
          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            throw new Error(
              `File ${file.name} is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB`
            );
          }

          // Handle HEIC/HEIF files
          if (file.type === "image/heic" || file.type === "image/heif") {
            if (!heic2any) {
              throw new Error("HEIC/HEIF conversion not available");
            }
            const convertedBlob = await heic2any({
              blob: file,
              toType: "image/jpeg",
              quality: 0.8,
            });
            return new File(
              [convertedBlob],
              file.name.replace(/\.(heic|heif)$/i, ".jpg"),
              {
                type: "image/jpeg",
              }
            );
          }

          // Compress other image types
          const compressedFile = await imageCompression(file, {
            maxSizeMB: MAX_IMAGE_SIZE_MB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          return new File([compressedFile], file.name, {
            type: file.type,
          });
        })
      );

      setNewImages((prev) => [...prev, ...processedFiles]);
      const newPreviewUrls = processedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    } catch (error: any) {
      toast.error(error.message || "Error processing images");
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
      console.log("Form data received:", formData);

      // Build FormData for updateListing
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });
      if (newImages.length > 0) {
        newImages.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Call updateListing with FormData
      await listingService.updateListing(listing.id, formDataToSend);

      // Delete removed images
      const currentImageIds = new Set(images.map((img) => img.id));
      const originalImageIds = new Set(listing.images.map((img) => img.id));
      const removedImageIds = Array.from(originalImageIds).filter(
        (id) => !currentImageIds.has(id)
      );
      for (const imageId of removedImageIds) {
        await listingService.deleteListingImage(listing.id, imageId);
      }

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
              Add or remove images (max {MAX_IMAGES_TOTAL} total,{" "}
              {MAX_IMAGE_SIZE_MB}MB per image)
            </p>
          </div>
          <label
            className={`relative inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
              isLoading || images.length + newImages.length >= MAX_IMAGES_TOTAL
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <ImagePlus className="h-4 w-4" />
            <span>Add Images</span>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={handleImageChange}
              disabled={
                isLoading ||
                images.length + newImages.length >= MAX_IMAGES_TOTAL
              }
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
