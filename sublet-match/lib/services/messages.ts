export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  participants: {
    id: string;
    username: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
}

export const messagesService = {
  async sendMessage(data: {
    content: string;
    receiverId: string;
    listingId: string;
  }) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async getConversations() {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async getMessages(conversationId: string) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async markAsRead(conversationId: string) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },

  async startConversation(listingId: string, message: string) {
    // Will be implemented when backend is ready
    return { success: false, error: "Backend not implemented yet" };
  },
};
