import axios from "axios";
import { authService } from "@/lib/services/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ListingImage {
  id: string;
  listing_id: string;
  created_at: string;
  image_url: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  state: string;
  available_from: string;
  available_to: string;
  images: { id: number; image_url: string }[];
  amenities?: string;
}

export interface CreateListingData {
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
  host: string;
  images: File[]; // Changed to handle File objects for image upload
}

class ListingService {
  private baseUrl = API_URL;

  async getMyListings(): Promise<Listing[]> {
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
      const errorData = await response.json();
      console.error("Error fetching listings:", errorData);
      throw new Error(errorData.detail || "Failed to fetch listings");
    }

    return await response.json();
  }

  async createListing(
    data: CreateListingData,
    token: string
  ): Promise<Listing> {
    try {
      console.log("Creating listing with data:", data);

      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add listing data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "images") {
          formData.append(key, value.toString());
        }
      });

      // Add images
      data.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(
        `${API_URL}/api/v1/listings/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error creating listing:", {
        error: error.response?.data || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async getListings(): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/listings/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  }

  async getListing(id: string): Promise<Listing> {
    const response = await axios.get(`${API_URL}/api/v1/listings/${id}`);
    return response.data;
  }

  async updateListing(
    id: string,
    data: Partial<CreateListingData>,
    token: string
  ): Promise<Listing> {
    const formData = new FormData();

    // Add listing data
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "images" && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add images if they exist
    if (data.images) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await axios.put(
      `${API_URL}/api/v1/listings/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async deleteListing(id: string, token: string): Promise<void> {
    await axios.delete(`${API_URL}/api/v1/listings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getAllListings() {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/listings`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching listings:", errorData);
        throw new Error(errorData.detail || "Failed to fetch listings");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  }
}

export const listingService = new ListingService();
