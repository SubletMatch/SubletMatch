import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Listing {
  id: number;
  user_id: string;
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
  status: string;
  created_at: string;
  updated_at: string;
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
}

export const listingService = {
  async createListing(
    data: CreateListingData,
    token: string
  ): Promise<Listing> {
    try {
      console.log("Creating listing with data:", data);

      const response = await axios.post(`${API_URL}/api/v1/listings/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error creating listing:", {
        error: error.response?.data || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  async getListings(): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/listings/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  },

  async getListing(id: string): Promise<Listing> {
    const response = await axios.get(`${API_URL}/api/v1/listings/${id}`);
    return response.data;
  },

  async updateListing(
    id: string,
    data: Partial<CreateListingData>,
    token: string
  ): Promise<Listing> {
    const response = await axios.put(`${API_URL}/api/v1/listings/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  async deleteListing(id: string, token: string): Promise<void> {
    await axios.delete(`${API_URL}/api/v1/listings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default listingService;
