import { userService } from "@/app/services/user";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing_title?: string;
  listing_owner_id?: string;
  participants: {
    id: string;
    username: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const messagesService = {
  async sendMessage(data: {
    content: string;
    receiver_id: string;
    listing_id: string;
    sender_id: string;
  }) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Sending message with data:", data);

      const response = await fetch(`${API_BASE_URL}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Message send failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.detail || "Failed to send message");
      }

      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error: unknown) {
      console.error("Error in sendMessage:", error);
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An unknown error occurred" };
    }
  },

  async getConversations() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get current user's ID from user service
      const currentUser = await userService.getCurrentUser(token);
      if (!currentUser?.id) {
        throw new Error("Could not get current user information");
      }

      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${currentUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const conversations = await response.json();
      return { success: true, data: conversations };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An unknown error occurred" };
    }
  },

  async getMessages(conversationId: string) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get current user's ID from user service
      const currentUser = await userService.getCurrentUser(token);
      if (!currentUser?.id) {
        throw new Error("Could not get current user information");
      }

      const [listingId, otherUserId] = conversationId.split("_");

      const response = await fetch(
        `${API_BASE_URL}/messages/conversation/${listingId}/${currentUser.id}/${otherUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      return { success: true, data: await response.json() };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An unknown error occurred" };
    }
  },

  async markAsRead(conversationId: string) {
    // This will be implemented when the backend supports it
    return { success: true };
  },

  async startConversation(listingId: string, message: string) {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("No user ID found in localStorage");
      }
      const response = await fetch(`${API_BASE_URL}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          listing_id: listingId,
          sender_id: userId,
          receiver_id: listingId, // This should be the listing owner's ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      return { success: true, data: await response.json() };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An unknown error occurred" };
    }
  },
};
