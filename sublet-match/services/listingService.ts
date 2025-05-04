export const deleteListing = async (listingId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/listings/${listingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete listing");
  }
};
