"use client";

import { MessageList } from "@/components/messaging/MessageList";
import { ChatInterface } from "@/components/messaging/ChatInterface";
import { messagesService } from "@/lib/services/messages";
import { useState } from "react";
import { Conversation, Message } from "@/lib/services/messages";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId] = useState("1"); // This will come from auth context later

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Will be implemented when backend is ready
    const result = await messagesService.getMessages(conversationId);
    if (result.success && "data" in result) {
      setMessages(result.data as Message[]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;
    // Will be implemented when backend is ready
    const result = await messagesService.sendMessage({
      content,
      receiverId: "2", // This will come from the conversation data
      listingId: "1", // This will come from the conversation data
    });
    if (result.success && "data" in result) {
      setMessages([...messages, result.data as Message]);
    }
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-1 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          <MessageList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </div>
        <div className="md:col-span-2 border rounded-lg">
          {selectedConversationId ? (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={currentUserId}
              otherUser={{
                id: "2",
                username: "John Doe", // This will come from the conversation data
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
