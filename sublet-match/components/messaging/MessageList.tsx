import { Conversation } from "@/lib/services/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { userService } from "@/app/services/user";
import { useEffect, useState } from "react";

interface MessageListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export function MessageList({
  conversations,
  onSelectConversation,
  selectedConversationId,
}: MessageListProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const getCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const currentUser = await userService.getCurrentUser(token);
      if (currentUser?.id) {
        setCurrentUserId(currentUser.id);
      }
    };

    getCurrentUser();
  }, []);

  if (conversations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (p) => p.id !== currentUserId
        );

        if (!otherParticipant) return null;

        return (
          <Card
            key={conversation.id}
            className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
              selectedConversationId === conversation.id ? "bg-muted" : ""
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`/avatars/${otherParticipant.id}.png`} />
                <AvatarFallback>
                  {otherParticipant.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">
                    {otherParticipant.username}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(conversation.lastMessage.timestamp),
                      {
                        addSuffix: true,
                      }
                    )}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage.content}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
