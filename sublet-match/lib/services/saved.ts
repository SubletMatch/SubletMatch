const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function saveListing(userId: string, listingId: string) {
  const url = new URL(`${API_URL}/saved/saved-listings/`);
  url.searchParams.append("user_id", userId);
  url.searchParams.append("listing_id", listingId);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to save listing");
}

export async function unsaveListing(userId: string, listingId: string) {
  const url = new URL(`${API_URL}/saved/saved-listings/`);
  url.searchParams.append("user_id", userId);
  url.searchParams.append("listing_id", listingId);

  const res = await fetch(url.toString(), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unsave listing");
}