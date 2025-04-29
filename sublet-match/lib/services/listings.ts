export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  startDate: string;
  endDate: string;
  images: string[];
  amenities: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  location: string;
  startDate: string;
  endDate: string;
  images: File[];
  amenities: string[];
}

export const listingsService = {
  async createListing(data: CreateListingData) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async getListings(filters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
  }) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async getListingById(id: string) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async updateListing(id: string, data: Partial<CreateListingData>) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async deleteListing(id: string) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },
};
