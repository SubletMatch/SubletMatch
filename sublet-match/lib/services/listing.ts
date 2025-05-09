import { authService } from "./auth";

export class ListingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  }

  async getListings() {
    const response = await fetch(`${this.baseUrl}/listings`);
    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }
    return response.json();
  }

  async getListing(id: string) {
    const response = await fetch(`${this.baseUrl}/listings/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch listing");
    }
    return response.json();
  }

  async getMyListings() {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${this.baseUrl}/listings/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }
    return response.json();
  }

  async createListing(data: any) {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${this.baseUrl}/listings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create listing");
    }
    return response.json();
  }

  async updateListing(id: string, data: any) {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    console.log("Update listing request:");
    console.log("Listing ID:", id);
    console.log("Data type:", typeof data);
    console.log("Data instanceof FormData:", data instanceof FormData);

    // Capture FormData contents before processing
    const formDataKeys = Array.from(data.keys());
    const formDataEntries: Array<[string, string | File]> = Array.from(data.entries());
    console.log("Captured FormData keys:", formDataKeys);
    console.log("Captured FormData entries:", formDataEntries);

    // If it's FormData, try to read its contents
    if (data instanceof FormData) {
      console.log("FormData entries:");
      // Use the captured entries instead of directly from FormData
      for (const [key, value] of formDataEntries) {       
         console.log(`Key: ${key}, Value: ${value instanceof File ? value.name : value}`);
      }
    } else {
      console.log("Data content:", data);
    }

    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      throw new Error(error.detail || "Failed to update listing");
    }
    return response.json();
  }

  async deleteListing(listingId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/listings/${listingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete listing");
    }
  }

  async deleteListingImage(listingId: string, imageId: string) {
    const token = authService.getToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${this.baseUrl}/listings/${listingId}/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete image");
    }

    return response.json();
  }
}

export const listingService = new ListingService();
