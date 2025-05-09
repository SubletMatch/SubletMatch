"use client";

import { MessageList } from "@/components/messaging/MessageList";
import { ChatInterface } from "@/components/messaging/ChatInterface";
import { messagesService } from "@/lib/services/messages";
import { useState, useEffect, useRef } from "react";
import { Conversation, Message } from "@/lib/services/messages";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { userService } from "@/app/services/user";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (!selectedConversationId) return;

    const pollMessages = async () => {
      const result = await messagesService.getMessages(selectedConversationId);
      if (result.success && "data" in result) {
        setMessages(result.data as Message[]);
      }
    };

    pollingRef.current = setInterval(pollMessages, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedConversationId]);

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
      const [listingId] = selectedConversationId.split("_");
      let rawUserId = localStorage.getItem("userId");
      let currentUserId = rawUserId ? rawUserId : "";
      // If userId is missing, fetch and set it
      if (!currentUserId) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const user = await userService.getCurrentUser(token);
            if (user?.id) {
              localStorage.setItem("userId", user.id);
              currentUserId = user.id;
            }
          } catch (e) {
            setError("Could not fetch user info. Please re-login.");
            return;
          }
        } else {
          setError("You must be logged in to send messages.");
          return;
        }
      }
      const conversation = conversations.find(
        (c) => c.id === selectedConversationId
      );
      let otherUser = { id: "", username: "Other User" };
      if (conversation) {
        const participant = conversation.participants.find(
          (p) => p.id !== currentUserId
        );
        if (participant) {
          otherUser = participant;
        }
      }

      if (!otherUser) {
        setError("Could not determine receiver for this conversation.");
        return;
      }

      const result = await messagesService.sendMessage({
        content,
        receiver_id: otherUser.id,
        listing_id: listingId,
        sender_id: currentUserId,
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
    router.push("/dashboard?tab=messages");
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
              const rawUserId = localStorage.getItem("userId");
              const currentUserId = rawUserId ? rawUserId : "";
              if (conversation) {
                const participant = conversation.participants.find(
                  (p) => p.id !== currentUserId
                );
                if (participant) {
                  otherUser = participant;
                }
              }
              return (
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUserId={currentUserId}
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
