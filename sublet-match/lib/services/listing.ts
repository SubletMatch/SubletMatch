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

    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
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
