import { listingService } from "@/lib/services/listing";
import { EditListingForm } from "@/components/edit-listing-form";

interface PageParams {
  id: string;
}

export default async function EditListingPage({
  params,
}: {
  params: PageParams;
}) {
  const listingId = params.id;

  try {
    const listing = await listingService.getListing(listingId);
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
        <EditListingForm listing={listing} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching listing:", error);
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">Failed to load listing</div>
      </div>
    );
  }
}
 