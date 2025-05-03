"use client";

import { MessageList } from "@/components/messaging/MessageList";
import { ChatInterface } from "@/components/messaging/ChatInterface";
import { messagesService } from "@/lib/services/messages";
import { useState, useEffect } from "react";
import { Conversation, Message } from "@/lib/services/messages";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const result = await messagesService.getConversations();
        if (result.success && "data" in result) {
          setConversations(result.data as Conversation[]);
        } else {
          setError(result.error || "Failed to load conversations");
        }
      } catch (err) {
        setError("An error occurred while loading conversations");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      setSelectedConversationId(conversationId);
      (async () => {
        setIsLoading(true);
        const result = await messagesService.getMessages(conversationId);
        if (result.success && "data" in result) {
          setMessages(result.data as Message[]);
        } else {
          setError(result.error || "Failed to load messages");
        }
        setIsLoading(false);
      })();
    }
  }, [searchParams, conversations]);

  const handleSelectConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      setSelectedConversationId(conversationId);
      const result = await messagesService.getMessages(conversationId);
      if (result.success && "data" in result) {
        setMessages(result.data as Message[]);
      } else {
        setError(result.error || "Failed to load messages");
      }
    } catch (err) {
      setError("An error occurred while loading messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      const [listingId, otherUserId] = selectedConversationId.split("_");
      const result = await messagesService.sendMessage({
        content,
        receiver_id: otherUserId,
        listing_id: listingId,
        sender_id: localStorage.getItem("userId") || "",
      });

      if (result.success && "data" in result) {
        setMessages([...messages, result.data as Message]);
      } else {
        setError(result.error || "Failed to send message");
      }
    } catch (err) {
      setError("An error occurred while sending the message");
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

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
          <div className="p-4 border-b">
            <Button variant="ghost" onClick={handleBackClick}>
              Back
            </Button>
          </div>
          {selectedConversationId ? (
            (() => {
              const conversation = conversations.find(
                (c) => c.id === selectedConversationId
              );
              let otherUser = { id: "", username: "Other User" };
              if (conversation) {
                const ownerParticipant = conversation.participants.find(
                  (p) => p.id === conversation.listing_owner_id
                );
                if (ownerParticipant) {
                  otherUser = ownerParticipant;
                }
              }
              return (
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUserId={localStorage.getItem("userId") || ""}
                  otherUser={otherUser}
                />
              );
            })()
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
