"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { listingService } from "@/lib/services/listing"; // Make sure this service has methods for add/delete images
import { ListingForm } from "@/components/listing-form";
import { toast } from "sonner";
import { ImagePlus, Trash2, Loader2 } from "lucide-react"; // Added Loader2
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ListingImage {
  id: string;
  image_url: string;
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
    images: ListingImage[]; // Use the defined interface
  };
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  // State for existing images (those already on the server)
  const [existingImages, setExistingImages] = useState<ListingImage[]>(listing.images || []);
  // State for newly added image files
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // State for preview URLs of new images
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
  // State for IDs of existing images that are marked for deletion
  const [imageIdsToDelete, setImageIdsToDelete] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log("handleImageChange: Files selected:", files.map(f => f.name));
    if (files.length > 0) {
      const currentTotalImages = existingImages.length + newImageFiles.length;
      if (currentTotalImages + files.length > 10) { // Example limit
          toast.error("You can upload a maximum of 10 images.");
          return;
      }
      setNewImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviewUrls((prev) => [...prev, ...newPreviews]);
    }
    // Reset file input to allow selecting same file again if needed
    if (e.target) e.target.value = "";
  };

  const removeImage = (index: number, isExistingImage: boolean) => {
    console.log(`removeImage: index=${index}, isExistingImage=${isExistingImage}`);
    if (isExistingImage) {
      const imageToRemove = existingImages[index];
      if (imageToRemove) {
        console.log(`removeImage: Marking existing image for deletion: ID=${imageToRemove.id}, URL=${imageToRemove.image_url}`);
        // Add to deletion queue, actual deletion happens on save
        setImageIdsToDelete(prev => [...prev, imageToRemove.id]);
        // Remove from UI display
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
      }
    } else {
      // This is a new, unsaved image
      console.log(`removeImage: Removing new image at preview index ${index}`);
      const urlToRevoke = newImagePreviewUrls[index];
      URL.revokeObjectURL(urlToRevoke);
      setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
      setNewImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmitFormViaButton = () => {
    // Trigger the submit event of the inner form from ListingForm
    const form = document.getElementById("inner-listing-form"); // Assuming ListingForm has an id="inner-listing-form" on its <form>
    if (form) {
      // Create a temporary submit button and click it programmatically
      // This is a common way to trigger form submission that includes HTML5 validation
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.style.display = 'none';
      form.appendChild(submitButton);
      submitButton.click();
      form.removeChild(submitButton);
    } else {
      console.error("Inner ListingForm not found. Cannot submit.");
      toast.error("Could not submit form. Please try again.");
    }
  };


  // This `handleSubmit` is called by the <ListingForm onSubmit={handleSubmit}>
  // It receives the TEXTUAL form data from the inner ListingForm.
  const handleListingFormSubmit = async (textFormData: Record<string, string | number>) => {
    setIsLoading(true);
    let anyError = false;
    console.log("--- Initiating Save Process ---");
    console.log("Textual form data from ListingForm:", textFormData);
    console.log("New image files to upload:", newImageFiles.map(f => f.name));
    console.log("Existing image IDs to delete:", imageIdsToDelete);

    try {
      // Step 1: Update textual listing data
      // The `listingService.updateListing` should send data in a format
      // your backend PUT /listings/{id} endpoint expects (e.g., JSON or form-data without files).
      // If it expects FormData, we construct it here ONLY with textual data.
      console.log("Step 1: Updating textual listing data...");
      const updatePayload = new FormData();
      for (const key in textFormData) {
        updatePayload.append(key, String(textFormData[key]));
      }
      // Ensure your listingService.updateListing sends this payload correctly.
      // If your backend PUT endpoint expects JSON, then send textFormData directly as JSON.
      // Based on your backend `update_listing` using `await request.form()`, it expects FormData.
      await listingService.updateListing(listing.id, updatePayload);
      console.log("Textual data update successful.");

      // Step 2: Delete images marked for deletion
      if (imageIdsToDelete.length > 0) {
        console.log("Step 2: Deleting images...", imageIdsToDelete);
        for (const imageId of imageIdsToDelete) {
          try {
            await listingService.deleteListingImage(listing.id, imageId);
            console.log(`Deleted image ${imageId}`);
          } catch (deleteError) {
            console.error(`Failed to delete image ${imageId}:`, deleteError);
            toast.error(`Failed to delete image (ID: ...${imageId.slice(-6)})`);
            anyError = true; // Continue with other operations
          }
        }
        setImageIdsToDelete([]); // Clear queue after attempting deletion
      }

      // Step 3: Upload new images
      if (newImageFiles.length > 0) {
        console.log("Step 3: Uploading new images...", newImageFiles.map(f => f.name));
        const imageUploadFormData = new FormData();
        newImageFiles.forEach((file) => {
          imageUploadFormData.append("images", file); // Backend expects 'images' field
        });

        // Assuming listingService has an uploadImages method that hits POST /{listing_id}/images
        // and sends FormData.
        await listingService.uploadListingImages(listing.id, imageUploadFormData);
        console.log("New images uploaded successfully.");
        setNewImageFiles([]);
        setNewImagePreviewUrls(prev => { // Clean up blob URLs
            prev.forEach(URL.revokeObjectURL);
            return [];
        });
      }

      if (!anyError) {
        toast.success("Listing updated successfully!");
        router.push("/dashboard"); // Or to the listing view page
        router.refresh(); // Good practice to refresh router cache for dynamic routes
      } else {
        toast.warning("Listing updated with some errors during image processing.");
        // Optionally, re-fetch listing data here to show the current state if some operations failed.
        // router.refresh(); // or fetchListingData();
      }

    } catch (error) {
      console.error("Error during listing update process:", error);
      toast.error("Failed to update listing. Check console for details.");
      anyError = true;
    } finally {
      setIsLoading(false);
      console.log("--- Save Process Finished ---");
    }
  };  

  return (
    <div className="space-y-8">
      {/*
        The ListingForm will call `handleListingFormSubmit` when its internal form is submitted.
        It should have its own <form> element, perhaps with an ID.
      */}
      <ListingForm
        listing={listing}
        onSubmit={handleListingFormSubmit} // This is now for TEXT data from ListingForm
        showButtons={false} // We use custom buttons below
        formId="inner-listing-form" // Add a formId prop to ListingForm if it doesn't have one
      />

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Listing Images</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add or remove images for your listing (max 10 total).
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
              disabled={isLoading}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Display existing images */}
          {existingImages.map((image, index) => (
            <div
              key={`existing-${image.id}`} // Use a unique key
              className="relative aspect-square group rounded-lg overflow-hidden border"
            >
              <Image
                src={image.image_url}
                alt={`Existing image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index, true)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                  aria-label="Delete existing image"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Display previews of new images */}
          {newImagePreviewUrls.map((url, index) => (
            <div
              key={`new-preview-${url}`} // Blob URLs are unique enough for keys here
              className="relative aspect-square group rounded-lg overflow-hidden border"
            >
              <Image
                src={url}
                alt={`New image preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index, false)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                  aria-label="Remove new image"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {(existingImages.length === 0 && newImagePreviewUrls.length === 0) && (
            <div className="col-span-full aspect-[2/1] border-2 border-dashed rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No images added yet. Click "Add Images".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Save/Cancel Buttons for the entire Edit Operation */}
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
          type="button" // Changed from "submit"
          disabled={isLoading}
          onClick={handleSubmitFormViaButton} // This will trigger the ListingForm's submit
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}