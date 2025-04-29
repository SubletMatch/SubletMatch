import { Conversation } from "@/lib/services/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

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
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
            selectedConversationId === conversation.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`/avatars/${conversation.participants[0].id}.png`}
              />
              <AvatarFallback>
                {conversation.participants[0].username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {conversation.participants[0].username}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(conversation.lastMessage.createdAt),
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
      ))}
    </div>
  );
}
